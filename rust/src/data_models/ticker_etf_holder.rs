use crate::types::TickerId;
use crate::utils::shard::query_shard_for_id;
use crate::ETFAggregateDetail;
use crate::JsValue;
use crate::{DataURL, PaginatedResults};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerETFHolder {
    // TODO: Rename to `etf_ticker_id`
    pub ticker_id: TickerId,
    pub etf_ticker_ids_json: String,
}

impl TickerETFHolder {
    pub async fn get_etf_holders_aggregate_detail_by_ticker_id(
        // TODO: Rename to `etf_ticker_id`
        ticker_id: TickerId,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<ETFAggregateDetail>, JsValue> {
        let paginated_etf_holder_ids =
            TickerETFHolder::get_ticker_etf_holder_ids_by_ticker_id(ticker_id, page, page_size)
                .await?;

        let mut etf_aggregate_details = Vec::new();

        for etf_ticker_id in paginated_etf_holder_ids.results {
            match ETFAggregateDetail::get_etf_aggregate_detail_by_ticker_id(etf_ticker_id).await {
                Ok(detail) => etf_aggregate_details.push(detail),
                Err(e) => {
                    web_sys::console::warn_2(
                        &format!(
                            "Failed to fetch ETF aggregate detail for ticker ID: {}: {:?}",
                            etf_ticker_id, e
                        )
                        .into(),
                        &e,
                    );
                }
            }
        }

        // Create paginated results for the ETF aggregate details
        let paginated_results = PaginatedResults {
            results: etf_aggregate_details,
            total_count: paginated_etf_holder_ids.total_count,
        };

        Ok(paginated_results)
    }

    async fn get_ticker_etf_holder_ids_by_ticker_id(
        // TODO: Rename to `etf_ticker_id`
        ticker_id: TickerId,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerId>, JsValue> {
        // Log the start of the function
        // web_sys::console::debug_1(&format!("Fetching ticker ETF holders for ticker_id: {}", ticker_id).into());

        let url: &str = &DataURL::TickerETFHoldersShardIndex.value();

        // Query shard for the ticker_id
        // web_sys::console::debug_1(&format!("Querying shard for ticker_id: {}", ticker_id).into());
        let holder = query_shard_for_id(url, &ticker_id, |detail: &TickerETFHolder| {
            Some(&detail.ticker_id)
        })
        .await?
        .ok_or_else(|| {
            // web_sys::console::debug_1(&format!("Ticker not found in shard for ticker_id: {}", ticker_id).into());
            JsValue::from_str(&format!("Ticker ID {} not found", ticker_id))
        })?;

        // web_sys::console::debug_1(&format!("Found holder for ticker_id: {}", ticker_id).into());

        // Parse the ETF ticker IDs JSON
        // web_sys::console::debug_1(&format!("Parsing ETF ticker IDs JSON for ticker_id: {}", ticker_id).into());
        let etf_ticker_ids: Vec<TickerId> = serde_json::from_str(&holder.etf_ticker_ids_json)
            .map_err(|e| {
                // web_sys::console::debug_1(&format!("Failed to parse etf_ticker_ids_json for ticker_id: {}: {}", ticker_id, e).into());
                JsValue::from_str(&format!("Failed to parse etf_ticker_ids_json: {}", e))
            })?;

        // Paginate the results
        // web_sys::console::debug_1(&format!("Paginating results for ticker_id: {}", ticker_id).into());
        let paginated_results = PaginatedResults::paginate(etf_ticker_ids, page, page_size)?;

        // web_sys::console::debug_1(&format!("Returning paginated results for ticker_id: {}", ticker_id).into());
        Ok(paginated_results)
    }
}
