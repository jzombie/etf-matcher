use serde::{Deserialize, Serialize};
use crate::data_models::DataURL;
use crate::utils::shard::query_shard_for_value;
use crate::JsValue;
use crate::types::TickerId;

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    pub ticker_id: TickerId,
    pub etf_symbol: String,
    // TODO: Add `exchange_short_name`?
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
    pub async fn get_etf_aggregate_detail_by_ticker_id(ticker_id: TickerId) -> Result<ETFAggregateDetail, JsValue> {
        let url: &str = DataURL::ETFAggregateDetailShardIndex.value();
        let etf_aggregate_detail: ETFAggregateDetail = query_shard_for_value(
            url,
            &ticker_id,
            |etf_aggregate_detail: &ETFAggregateDetail| Some(&etf_aggregate_detail.ticker_id),
        )
        .await?
        .ok_or_else(|| JsValue::from_str("ETF ticker not found"))?;

        Ok(etf_aggregate_detail)
    }
}
