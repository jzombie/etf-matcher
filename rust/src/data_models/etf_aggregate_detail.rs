use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::utils::shard::query_shard_for_symbol;
use crate::data_models::DataURL;

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    pub ticker_id: i32,
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
    pub async fn get_etf_aggregate_detail(etf_symbol: &str) -> Result<ETFAggregateDetail, JsValue> {
        let url: &str = DataURL::ETFAggregateDetailShardIndex.value();
        let etf_aggregate_detail: ETFAggregateDetail = query_shard_for_symbol(url, etf_symbol, |etf_aggregate_detail: &ETFAggregateDetail| {
            Some(&etf_aggregate_detail.etf_symbol)
        })
        .await?
        .ok_or_else(|| JsValue::from_str("ETF symbol not found"))?;

        Ok(etf_aggregate_detail)
    }
}
