use crate::types::{IndustryId, SectorId, TickerId, TickerWeightedSectorDistribution};
use crate::utils::extract_logo_filename;
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils::get_symbol_and_exchange_by_ticker_id;
use crate::DataURL;
use crate::IndustryById;
use crate::JsValue;
use crate::SectorById;
use crate::TickerSearch;
use serde::{Deserialize, Serialize};
use serde_json::Value;

impl TickerWeightedSectorDistribution {
    async fn parse_major_sector_distribution(
        json_str: &str,
    ) -> Result<Vec<TickerWeightedSectorDistribution>, String> {
        // Parse the JSON and handle any errors
        let parsed_json: Value =
            serde_json::from_str(json_str).map_err(|e| format!("Failed to parse JSON: {}", e))?;
        let mut result = Vec::new();

        // Ensure that we are dealing with an object
        if let Value::Object(map) = parsed_json {
            for (key, value) in map {
                // Attempt to parse the key as SectorId and the value as f64
                let major_sector_id = key
                    .parse::<SectorId>()
                    .map_err(|_| format!("Failed to parse sector ID from key: {}", key))?;

                if let Some(weight) = value.as_f64() {
                    // Ensure the weight is within valid f32 range
                    if weight > f32::MAX as f64 || weight < f32::MIN as f64 {
                        return Err(format!("Weight value {} is out of range for f32", weight));
                    }
                    // let weight_f32 = weight as f32; // Safe to cast now

                    // Fetch the major sector name asynchronously
                    if let Ok(major_sector_name) =
                        SectorById::get_major_sector_name_with_id(major_sector_id).await
                    {
                        result.push(TickerWeightedSectorDistribution {
                            major_sector_name, // Use sector name instead of ID
                            weight,
                        });
                    } else {
                        return Err(format!(
                            "Failed to get major sector name for sector ID: {}",
                            major_sector_id
                        ));
                    }
                } else {
                    return Err(format!(
                        "Invalid weight value for sector ID: {}",
                        major_sector_id
                    ));
                }
            }
            Ok(result)
        } else {
            Err("Expected a JSON object".to_string())
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetailRaw {
    pub ticker_id: TickerId,
    pub etf_name: Option<String>,
    pub expense_ratio: f32,
    // TODO: Add `aum` (assets under management)  and `nav` (net asset value)
    pub top_market_value_sector_id: Option<SectorId>,
    pub top_market_value_industry_id: Option<IndustryId>,
    pub top_sector_market_value: f64,
    pub currency_code: Option<String>,
    pub top_pct_sector_id: Option<SectorId>,
    pub top_pct_industry_id: Option<IndustryId>,
    pub top_pct_sector_weight: f32,
    //
    pub major_sector_distribution: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    pub ticker_id: TickerId,
    pub etf_symbol: String,
    pub expense_ratio: f32,
    pub exchange_short_name: Option<String>,
    pub etf_name: Option<String>,
    pub top_market_value_sector_name: Option<String>,
    pub top_market_value_industry_name: Option<String>,
    pub top_sector_market_value: f64,
    pub currency_code: Option<String>,
    pub top_pct_sector_name: Option<String>,
    pub top_pct_industry_name: Option<String>,
    pub top_pct_sector_weight: f32,
    //
    pub major_sector_distribution: Option<Vec<TickerWeightedSectorDistribution>>,
    //
    pub logo_filename: Option<String>, // TODO: Remove `logo_filename` from here?  Just get from ticker
}

impl ETFAggregateDetail {
    pub async fn get_etf_aggregate_detail_by_ticker_id(
        // TODO: Rename to `etf_ticker_id`
        ticker_id: TickerId,
    ) -> Result<ETFAggregateDetail, JsValue> {
        let url: &str = &DataURL::ETFAggregateDetailShardIndex.value();
        let etf_aggregate_detail_raw: ETFAggregateDetailRaw = query_shard_for_id(
            url,
            &ticker_id,
            |etf_aggregate_detail_raw: &ETFAggregateDetailRaw| {
                Some(&etf_aggregate_detail_raw.ticker_id)
            },
        )
        .await?
        .ok_or_else(|| JsValue::from_str(&format!("ETF ticker ID {} not found", ticker_id)))?;

        // Fetch the symbol and exchange short name
        let (etf_symbol, exchange_short_name) =
            get_symbol_and_exchange_by_ticker_id(ticker_id).await?;

        let top_market_value_sector_name = match etf_aggregate_detail_raw.top_market_value_sector_id
        {
            Some(top_market_value_sector_id) => {
                SectorById::get_sector_name_with_id(top_market_value_sector_id)
                    .await
                    .ok()
            }
            None => None,
        };

        let top_market_value_industry_name =
            match etf_aggregate_detail_raw.top_market_value_industry_id {
                Some(top_market_value_industry_id) => {
                    IndustryById::get_industry_name_with_id(top_market_value_industry_id)
                        .await
                        .ok()
                }
                None => None,
            };

        let top_pct_sector_name = match etf_aggregate_detail_raw.top_pct_sector_id {
            Some(top_pct_sector_id) => SectorById::get_sector_name_with_id(top_pct_sector_id)
                .await
                .ok(),
            None => None,
        };

        let top_pct_industry_name = match etf_aggregate_detail_raw.top_pct_industry_id {
            Some(top_pct_industry_id) => {
                IndustryById::get_industry_name_with_id(top_pct_industry_id)
                    .await
                    .ok()
            }
            None => None,
        };

        let ticker_raw_search_result = TickerSearch::get_raw_result_with_id(ticker_id).await?;
        let logo_filename = extract_logo_filename(
            ticker_raw_search_result.logo_filename.as_deref(),
            &ticker_raw_search_result.symbol,
        );

        let major_sector_distribution: Option<Vec<TickerWeightedSectorDistribution>> =
            match &etf_aggregate_detail_raw.major_sector_distribution {
                Some(json_str) => {
                    match TickerWeightedSectorDistribution::parse_major_sector_distribution(
                        json_str,
                    )
                    .await
                    {
                        Ok(sector_weights) => Some(sector_weights),
                        Err(err) => {
                            // Handle the error, log if necessary, and return None
                            let error_message = format!(
                                "Error parsing ETF sector distribution for ticker ID {}: {}",
                                etf_aggregate_detail_raw.ticker_id, err
                            );
                            web_sys::console::error_1(&error_message.into());
                            None
                        }
                    }
                }
                None => None,
            };

        let response = ETFAggregateDetail {
            ticker_id: etf_aggregate_detail_raw.ticker_id,
            etf_symbol,
            expense_ratio: etf_aggregate_detail_raw.expense_ratio,
            exchange_short_name,
            etf_name: etf_aggregate_detail_raw.etf_name,
            top_market_value_sector_name,
            top_market_value_industry_name,
            top_sector_market_value: etf_aggregate_detail_raw.top_sector_market_value,
            currency_code: etf_aggregate_detail_raw.currency_code,
            top_pct_sector_name,
            top_pct_industry_name,
            top_pct_sector_weight: etf_aggregate_detail_raw.top_pct_sector_weight,
            //
            major_sector_distribution,
            //
            logo_filename,
        };

        Ok(response)
    }
}
