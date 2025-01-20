use crate::types::{
    IndustryId, SectorId, TickerId, TickerSymbol, TickerWeightedSectorDistribution,
};
use crate::utils::extract_logo_filename;
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils::get_ticker_id;
// use crate::utils::ticker_utils::get_symbol_and_exchange_by_ticker_id; // TODO: Remove
use crate::DataURL;
use crate::IndustryById;
use crate::JsValue;
use crate::SectorById;
use crate::TickerSearch;
use serde::{Deserialize, Serialize};
use serde_json::Value;

impl TickerWeightedSectorDistribution {
    /// This function parses a JSON string representing the "major sector distribution",
    /// where the keys are Sector IDs and the values are their respective weights.
    /// It then maps the Sector IDs to their corresponding Sector Names and constructs
    /// a vector of `TickerWeightedSectorDistribution` objects.
    ///
    /// The process involves:
    /// - Parsing the JSON string into a map of Sector IDs to weights.
    /// - Validating the weights are within the valid `f32` range.
    /// - Asynchronously resolving each Sector ID to its corresponding Sector Name.
    /// - Returning a vector of the resolved sector names and their weights.
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
    pub top_pct_industry_id: Option<IndustryId>,
    //
    pub major_sector_distribution: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    pub ticker_id: TickerId, // TODO: Remove?
    pub etf_ticker_symbol: String,
    pub expense_ratio: f32,
    pub exchange_short_name: Option<String>,
    pub etf_name: Option<String>,
    pub top_market_value_sector_name: Option<String>,
    pub top_market_value_industry_name: Option<String>,
    pub top_sector_market_value: f64,
    pub currency_code: Option<String>,
    pub logo_filename: Option<String>,
    //
    pub major_sector_distribution: Option<Vec<TickerWeightedSectorDistribution>>,
    //
    pub top_pct_sector_name: Option<String>,
    pub top_pct_sector_weight: f32,
    pub top_pct_industry_name: Option<String>,
}

impl ETFAggregateDetail {
    pub async fn get_etf_aggregate_detail(
        // TODO: Rename to `etf_ticker_symbol`
        ticker_symbol: TickerSymbol,
    ) -> Result<ETFAggregateDetail, JsValue> {
        let url: &str = &DataURL::ETFAggregateDetailShardIndex.value();

        let ticker_id = get_ticker_id(ticker_symbol.clone())
            .await
            .map_err(|_| JsValue::from_str("Could not locate ticker ID"))?;

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
        // let (etf_symbol, exchange_short_name) =
        //     get_symbol_and_exchange_by_ticker_id(ticker_id).await?;

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

        let (top_pct_sector_name, top_pct_sector_weight) = match &major_sector_distribution {
            Some(distribution) if !distribution.is_empty() => {
                // Find the sector with the highest weight
                if let Some(max_sector) = distribution.iter().max_by(|a, b| {
                    a.weight
                        .partial_cmp(&b.weight)
                        .unwrap_or(std::cmp::Ordering::Equal)
                }) {
                    (
                        Some(max_sector.major_sector_name.clone()),
                        max_sector.weight as f32,
                    )
                } else {
                    (None, 0.0)
                }
            }
            _ => (None, 0.0),
        };

        let top_pct_industry_name = match etf_aggregate_detail_raw.top_pct_industry_id {
            Some(top_pct_industry_id) => {
                IndustryById::get_industry_name_with_id(top_pct_industry_id)
                    .await
                    .ok()
            }
            None => None,
        };

        let response = ETFAggregateDetail {
            ticker_id: etf_aggregate_detail_raw.ticker_id,
            etf_ticker_symbol: ticker_symbol,
            expense_ratio: etf_aggregate_detail_raw.expense_ratio,
            exchange_short_name: Some("TODO: Use".to_string()),
            etf_name: etf_aggregate_detail_raw.etf_name,
            top_market_value_sector_name,
            top_market_value_industry_name,
            top_sector_market_value: etf_aggregate_detail_raw.top_sector_market_value,
            currency_code: etf_aggregate_detail_raw.currency_code,
            logo_filename,
            //
            major_sector_distribution,
            //
            top_pct_sector_name,
            top_pct_sector_weight,
            top_pct_industry_name,
        };

        Ok(response)
    }
}
