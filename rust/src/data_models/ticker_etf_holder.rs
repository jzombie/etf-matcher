use crate::data_models::{DataURL, PaginatedResults};
use serde::{Deserialize, Serialize};
use crate::utils::shard::query_shard_for_value;
// use crate::utils::ticker_utils::get_ticker_id;
use crate::JsValue;
use crate::types::TickerId;
// use web_sys::console;

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerETFHolder {
    pub ticker_id: TickerId,
    pub etf_ticker_ids_json: String,
}

impl TickerETFHolder {
    pub async fn get_ticker_etf_holders_by_ticker_id(
        // symbol: &str,
        // exchange_short_name: &str,
        ticker_id: TickerId,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerId>, JsValue> {
        // Log the start of the function
        // console::debug_1(&format!("Fetching ticker ETF holders for symbol: {}, exchange: {}", symbol, exchange_short_name).into());

        // Get the ticker_id using the utility function
        // let ticker_id = get_ticker_id(symbol, exchange_short_name).await?;

        let url: &str = DataURL::TickerETFHoldersShardIndex.value();

        // Query shard for the ticker_id
        // console::debug_1(&format!("Querying shard for ticker_id: {}", ticker_id).into());
        let holder = query_shard_for_value(url, &ticker_id, |detail: &TickerETFHolder| Some(&detail.ticker_id))
            .await?
            .ok_or_else(|| {
                // console::debug_1(&format!("Symbol not found in shard for ticker_id: {}", ticker_id).into());
                JsValue::from_str("Symbol not found")
            })?;

        // console::debug_1(&format!("Found holder for ticker_id: {}", ticker_id).into());

        // Parse the ETF ticker IDs JSON
        // console::debug_1(&format!("Parsing ETF ticker IDs JSON for ticker_id: {}", ticker_id).into());
        let etf_ticker_ids: Vec<TickerId> = serde_json::from_str(&holder.etf_ticker_ids_json)
            .map_err(|e| {
                // console::debug_1(&format!("Failed to parse etf_ticker_ids_json for ticker_id: {}: {}", ticker_id, e).into());
                JsValue::from_str(&format!("Failed to parse etf_ticker_ids_json: {}", e))
            })?;

        // Paginate the results
        // console::debug_1(&format!("Paginating results for ticker_id: {}", ticker_id).into());
        let paginated_results = PaginatedResults::paginate(etf_ticker_ids, page, page_size)?;

        // console::debug_1(&format!("Returning paginated results for ticker_id: {}", ticker_id).into());
        Ok(paginated_results)
    }
}
