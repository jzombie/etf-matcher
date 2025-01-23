use crate::types::{TickerId, TickerSymbol};
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils::{get_ticker_id, get_ticker_symbol};
use crate::ETFAggregateDetail;
use crate::JsValue;
use crate::{DataURL, PaginatedResults};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct TickerETFHolderRaw {
    // TODO: Rename to `etf_ticker_id`
    ticker_id: TickerId,
    etf_ticker_ids_json: String,
}

// Note: This struct is not used directly; `ETFAggregateDetail` is returned instead
pub struct TickerETFHolder {}

impl TickerETFHolder {
    pub async fn get_etf_holders_aggregate_detail(
        // TODO: Rename to `etf_ticker_symbol`
        ticker_symbol: TickerSymbol,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<ETFAggregateDetail>, JsValue> {
        let paginated_etf_holder_ids =
            Self::get_ticker_etf_holders(ticker_symbol, page, page_size).await?;

        let mut etf_aggregate_details = Vec::new();

        for etf_ticker_symbol in paginated_etf_holder_ids.results {
            match ETFAggregateDetail::get_etf_aggregate_detail(etf_ticker_symbol.clone()).await {
                Ok(detail) => etf_aggregate_details.push(detail),
                Err(e) => {
                    web_sys::console::warn_2(
                        &format!(
                            "Failed to fetch ETF aggregate detail for ticker {}: {:?}",
                            etf_ticker_symbol, e
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

    async fn get_ticker_etf_holders(
        ticker_symbol: TickerSymbol,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerSymbol>, JsValue> {
        let url: &str = &DataURL::TickerETFHoldersShardIndex.value();

        let ticker_id = get_ticker_id(ticker_symbol.clone())
            .await
            .map_err(|_| JsValue::from_str("Could not locate ticker ID"))?;

        // Query shard for the ticker_id
        let holder = query_shard_for_id(url, &ticker_id, |detail: &TickerETFHolderRaw| {
            Some(&detail.ticker_id)
        })
        .await?
        .ok_or_else(|| JsValue::from_str(&format!("Ticker {} not found", ticker_id)))?;

        // Parse the ETF ticker IDs JSON
        let etf_ticker_ids: Vec<TickerId> = serde_json::from_str(&holder.etf_ticker_ids_json)
            .map_err(|e| {
                JsValue::from_str(&format!("Failed to parse etf_ticker_ids_json: {}", e))
            })?;

        let etf_ticker_symbols = futures::future::join_all(
            etf_ticker_ids
                .iter()
                .map(|ticker_id| get_ticker_symbol(*ticker_id)),
        )
        .await
        .into_iter()
        .filter_map(Result::ok)
        .collect();

        // Paginate the results
        let paginated_results = PaginatedResults::paginate(etf_ticker_symbols, page, page_size)?;

        Ok(paginated_results)
    }
}
