use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::DataURL;
use crate::utils::shard::query_shard_for_value;
use crate::utils::ticker_utils::get_symbol_and_exchange_by_ticker_id;
use crate::types::TickerId;
// use web_sys::console;

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    ticker_id: TickerId,
    etf_name: Option<String>,
    top_market_value_sector_name: String,
    top_market_value_industry_name: String,
    top_sector_market_value: f32,
    currency_code: String,
    top_pct_sector_name: String,
    top_pct_industry_name: String,
    top_pct_sector_weight: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetailResponse {
    pub ticker_id: TickerId,
    pub etf_symbol: String,
    pub exchange_short_name: Option<String>,
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
    pub async fn get_etf_aggregate_detail_by_ticker_id(ticker_id: TickerId) -> Result<ETFAggregateDetailResponse, JsValue> {
        let url: &str = DataURL::ETFAggregateDetailShardIndex.value();
        let etf_aggregate_detail: ETFAggregateDetail = query_shard_for_value(
            url,
            &ticker_id,
            |etf_aggregate_detail: &ETFAggregateDetail| Some(&etf_aggregate_detail.ticker_id),
        )
        .await?
        .ok_or_else(|| JsValue::from_str("ETF ticker not found"))?;

        // Fetch the symbol and exchange short name
        let (etf_symbol, exchange_short_name) = get_symbol_and_exchange_by_ticker_id(ticker_id).await?;

        let response = ETFAggregateDetailResponse {
            ticker_id: etf_aggregate_detail.ticker_id,
            etf_symbol,
            exchange_short_name,
            etf_name: etf_aggregate_detail.etf_name,
            top_market_value_sector_name: etf_aggregate_detail.top_market_value_sector_name,
            top_market_value_industry_name: etf_aggregate_detail.top_market_value_industry_name,
            top_sector_market_value: etf_aggregate_detail.top_sector_market_value,
            currency_code: etf_aggregate_detail.currency_code,
            top_pct_sector_name: etf_aggregate_detail.top_pct_sector_name,
            top_pct_industry_name: etf_aggregate_detail.top_pct_industry_name,
            top_pct_sector_weight: etf_aggregate_detail.top_pct_sector_weight,
        };

        Ok(response)
    }
}
