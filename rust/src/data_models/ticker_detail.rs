use crate::types::{
    IndustryId, SectorId, TickerId, TickerSymbol, TickerWeightedSectorDistribution,
};
use crate::utils::logo_utils::extract_logo_filename;
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils::fetch_ticker_id;
use crate::DataURL;
use crate::ETFAggregateDetail;
use crate::IndustryById;
use crate::JsValue;
use crate::SectorById;
use futures::TryFutureExt;
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::HashMap;
use web_sys::console;

// TODO: Move to a utility (also search for `deserialize_is_current`)
// Custom deserialization function to convert Option<i32> to Option<bool>
fn from_numeric_to_bool<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    let num: i32 = i32::deserialize(deserializer)?;
    Ok(num != 0)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerDetailRaw {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub company_name: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub currency_code: Option<String>,
    pub industry_id: Option<IndustryId>,
    // Note: For ETFs, using the `major_sector_distribution` found in
    // `ETFAggregateDetail` will provide more granular results
    pub sector_id: Option<SectorId>,
    #[serde(deserialize_with = "from_numeric_to_bool")]
    pub is_etf: bool,
    #[serde(deserialize_with = "from_numeric_to_bool")]
    pub is_held_in_etf: bool,
    pub score_avg_dca: Option<f32>,
    pub logo_filename: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerDetail {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub company_name: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub currency_code: Option<String>,
    pub industry_name: Option<String>,
    pub sector_name: Option<String>,
    pub is_etf: bool,
    pub is_held_in_etf: bool,
    pub score_avg_dca: Option<f32>,
    pub logo_filename: Option<String>,
}

impl TickerDetail {
    pub async fn get_ticker_detail(ticker_symbol: TickerSymbol) -> Result<TickerDetail, JsValue> {
        let ticker_id = fetch_ticker_id(&ticker_symbol)
            .await
            .map_err(|_| JsValue::from_str("Could not locate ticker ID"))?;

        let url = DataURL::TickerDetailShardIndex.value();
        let mut raw_ticker_detail: TickerDetailRaw =
            query_shard_for_id(&url, &ticker_id, |raw_ticker_detail: &TickerDetailRaw| {
                Some(&raw_ticker_detail.ticker_id)
            })
            .await?
            .ok_or_else(|| {
                JsValue::from_str(&format!("Symbol not found for ticker ID {}", ticker_id))
            })?;

        // Extract the logo filename
        raw_ticker_detail.logo_filename = extract_logo_filename(
            raw_ticker_detail.logo_filename.as_deref(),
            &raw_ticker_detail.symbol,
        );

        // Retrieve industry name if industry_id is present
        let industry_name = match raw_ticker_detail.industry_id {
            Some(industry_id) => IndustryById::get_industry_name_with_id(industry_id)
                .await
                .ok(),
            None => None,
        };

        // Retrieve sector name if sector_id is ticker_detail
        let sector_name = match raw_ticker_detail.sector_id {
            Some(sector_id) => SectorById::get_sector_name_with_id(sector_id).await.ok(),
            None => None,
        };

        // Construct the response
        Ok(TickerDetail {
            ticker_id: raw_ticker_detail.ticker_id,
            symbol: raw_ticker_detail.symbol,
            exchange_short_name: raw_ticker_detail.exchange_short_name,
            company_name: raw_ticker_detail.company_name,
            cik: raw_ticker_detail.cik,
            country_code: raw_ticker_detail.country_code,
            currency_code: raw_ticker_detail.currency_code,
            industry_name,
            sector_name,
            is_etf: raw_ticker_detail.is_etf,
            is_held_in_etf: raw_ticker_detail.is_held_in_etf,
            score_avg_dca: raw_ticker_detail.score_avg_dca,
            logo_filename: raw_ticker_detail.logo_filename,
        })
    }

    pub async fn get_weighted_ticker_sector_distribution(
        ticker_weights: Vec<(TickerId, f64)>,
    ) -> Result<Vec<TickerWeightedSectorDistribution>, JsValue> {
        let mut sector_weights: HashMap<String, f64> = HashMap::new();
        let mut total_weight = 0.0;

        for (ticker_id, weight) in &ticker_weights {
            total_weight += weight;

            // Determine if the ticker is an ETF
            match TickerDetail::get_ticker_detail(*ticker_id).await {
                Ok(ticker_detail) => {
                    if ticker_detail.is_etf {
                        // Fetch ETF aggregate detail for major sector distribution
                        match ETFAggregateDetail::get_etf_aggregate_detail_by_ticker_id(*ticker_id)
                            .await
                        {
                            Ok(etf_detail) => {
                                if let Some(major_sector_distribution) =
                                    etf_detail.major_sector_distribution
                                {
                                    for sector_weight in major_sector_distribution {
                                        let entry = sector_weights
                                            .entry(sector_weight.major_sector_name)
                                            .or_insert(0.0);
                                        *entry += weight * sector_weight.weight as f64;
                                    }
                                } else if let Some(top_sector_name) = etf_detail.top_pct_sector_name
                                {
                                    let top_sector_weight = etf_detail.top_pct_sector_weight;
                                    let entry =
                                        sector_weights.entry(top_sector_name).or_insert(0.0);

                                    // Use top_sector_weight directly
                                    *entry += weight * top_sector_weight as f64;
                                } else {
                                    console::warn_1(&"No major sector distribution or fallback sector info found.".into());
                                }
                            }
                            // Note: Errors are logged here to capture issues with fetching ETF aggregate details,
                            // but they do not interrupt processing. The function continues to process other tickers.
                            Err(err) => console::error_1(
                                &format!(
                                    "Failed to fetch ETF aggregate detail for ticker ID {}: {:?}",
                                    ticker_id, err
                                )
                                .into(),
                            ),
                        }
                    } else {
                        // Note: I considered including the `sector_name` for non-ETF tickers in the
                        // distribution. This is often `Financial Services`, but doing so tends to
                        // skew the distribution significantly. If deciding to proceed with this
                        // approach, ensure the following logic is placed outside the current `else`
                        // block.
                        if let Some(sector_name) = ticker_detail.sector_name {
                            let entry = sector_weights.entry(sector_name).or_insert(0.0);
                            *entry += weight;
                        } else {
                            console::warn_1(
                                &format!("Ticker ID {} does not have a sector name.", ticker_id)
                                    .into(),
                            );
                        }
                    }
                }
                Err(_err) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to fetch details for ticker ID: {}",
                        ticker_id
                    )));
                }
            }
        }

        // Check for total_weight being zero to prevent division by zero
        if total_weight == 0.0 {
            return Err(JsValue::from_str(
                "Total weight is zero; cannot normalize weights.",
            ));
        }

        // Normalize weights
        let normalized_weights: Vec<TickerWeightedSectorDistribution> = sector_weights
            .into_iter()
            .map(
                |(major_sector_name, weight)| TickerWeightedSectorDistribution {
                    major_sector_name,
                    weight: weight / total_weight,
                },
            )
            .collect();

        Ok(normalized_weights)
    }
}
