use crate::types::{IndustryId, SectorId, TickerId, TickerWeightedSectorDistribution};
use crate::utils::logo_utils::extract_logo_filename;
use crate::utils::shard::query_shard_for_id;
use crate::DataURL;
use crate::ETFAggregateDetail;
use crate::IndustryById;
use crate::JsValue;
use crate::SectorById;
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::HashMap;

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
    pub async fn get_ticker_detail(ticker_id: TickerId) -> Result<TickerDetail, JsValue> {
        let url = DataURL::TickerDetailShardIndex.value();
        let mut detail: TickerDetailRaw =
            query_shard_for_id(&url, &ticker_id, |detail: &TickerDetailRaw| {
                Some(&detail.ticker_id)
            })
            .await?
            .ok_or_else(|| {
                JsValue::from_str(&format!("Symbol not found for ticker ID {}", ticker_id))
            })?;

        // Extract the logo filename
        detail.logo_filename =
            extract_logo_filename(detail.logo_filename.as_deref(), &detail.symbol);

        // Retrieve industry name if industry_id is present
        let industry_name = match detail.industry_id {
            Some(industry_id) => IndustryById::get_industry_name_with_id(industry_id)
                .await
                .ok(),
            None => None,
        };

        // Retrieve sector name if sector_id is present
        let sector_name = match detail.sector_id {
            Some(sector_id) => SectorById::get_sector_name_with_id(sector_id).await.ok(),
            None => None,
        };

        // Construct the response
        Ok(TickerDetail {
            ticker_id: detail.ticker_id,
            symbol: detail.symbol,
            exchange_short_name: detail.exchange_short_name,
            company_name: detail.company_name,
            cik: detail.cik,
            country_code: detail.country_code,
            currency_code: detail.currency_code,
            industry_name,
            sector_name,
            is_etf: detail.is_etf,
            is_held_in_etf: detail.is_held_in_etf,
            score_avg_dca: detail.score_avg_dca,
            logo_filename: detail.logo_filename,
        })
    }

    pub async fn get_weighted_ticker_sector_distribution(
        ticker_weights: Vec<(TickerId, f64)>,
    ) -> Result<Vec<TickerWeightedSectorDistribution>, JsValue> {
        let mut sector_weights: HashMap<String, f64> = HashMap::new();
        let mut total_weight = 0.0;

        for (ticker_id, weight) in ticker_weights {
            total_weight += weight;

            // Determine if the ticker is an ETF
            if let Ok(ticker_detail) = TickerDetail::get_ticker_detail(ticker_id).await {
                if ticker_detail.is_etf {
                    // Fetch ETF aggregate detail for major sector distribution
                    if let Ok(etf_detail) =
                        ETFAggregateDetail::get_etf_aggregate_detail_by_ticker_id(ticker_id).await
                    {
                        if let Some(major_sector_distribution) =
                            etf_detail.major_sector_distribution
                        {
                            for sector_weight in major_sector_distribution {
                                let entry = sector_weights
                                    .entry(sector_weight.major_sector_name.clone())
                                    .or_insert(0.0);
                                *entry += weight * sector_weight.weight as f64;
                            }
                        }
                    }
                } else {
                    // For non-ETFs, use the sector name from ticker detail
                    if let Some(sector_name) = ticker_detail.sector_name {
                        let entry = sector_weights.entry(sector_name).or_insert(0.0);
                        *entry += weight;
                    }
                }
            } else {
                return Err(JsValue::from_str(&format!(
                    "Failed to fetch details for ticker ID: {}",
                    ticker_id
                )));
            }
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
