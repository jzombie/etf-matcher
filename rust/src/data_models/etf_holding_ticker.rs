use crate::data_models::{DataURL, PaginatedResults};
use crate::types::TickerId;
use crate::utils::shard::query_shard_for_id;
use crate::JsValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingTicker {
    pub etf_ticker_id: TickerId,
    pub holdings_json: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingTickerResponse {
    // pub etf_ticker_id: TickerId,
    pub holding_ticker_id: TickerId,
    pub holding_market_value: f32,
    pub holding_percentage: f32,
}

impl ETFHoldingTicker {
    pub async fn get_etf_holdings_by_etf_ticker_id(
        etf_ticker_id: TickerId,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<ETFHoldingTickerResponse>, JsValue> {
        let url: &str = DataURL::ETFHoldingTickersShardIndex.value();

        // Query shard for the ETF ticker ID
        let holdings = query_shard_for_id(url, &etf_ticker_id, |detail: &ETFHoldingTicker| {
            Some(&detail.etf_ticker_id)
        })
        .await?
        .ok_or_else(|| JsValue::from_str("ETF ticker not found"))?;

        // Parse the ETF holdings JSON
        let etf_holdings: Vec<ETFHoldingTickerResponse> =
            serde_json::from_str(&holdings.holdings_json)
                .map_err(|e| JsValue::from_str(&format!("Failed to parse holdings JSON: {}", e)))?;

        // Paginate the results
        let paginated_results = PaginatedResults::paginate(etf_holdings, page, page_size)?;

        Ok(paginated_results)
    }
}
