use serde::{Deserialize, Serialize};
use crate::data_models::DataURL;
use crate::utils::shard::query_shard_for_value;
use crate::JsValue;
use crate::types::TickerId;

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    pub ticker_id: TickerId,
    pub etf_symbol: String,
    pub etf_name: Option<String>,
    pub top_market_value_sector_name: String,
    pub top_market_value_industry_name: String,
    pub top_sector_market_value: f32,
    pub currency_code: String,
    pub top_pct_sector_name: String,
    pub top_pct_industry_name: String,
    pub top_pct_sector_weight: f32,
}

impl ETFAggregateDetail {
    // TODO: Add `exchange` to query
    pub async fn get_etf_aggregate_detail(etf_symbol: &str) -> Result<ETFAggregateDetail, JsValue> {
        let url: &str = DataURL::ETFAggregateDetailShardIndex.value();
        let etf_aggregate_detail: ETFAggregateDetail = query_shard_for_value(
            url,
            &etf_symbol.to_string(),
            |etf_aggregate_detail: &ETFAggregateDetail| Some(&etf_aggregate_detail.etf_symbol),
        )
        .await?
        .ok_or_else(|| JsValue::from_str("ETF symbol not found"))?;

        Ok(etf_aggregate_detail)
    }
}
