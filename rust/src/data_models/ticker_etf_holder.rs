use crate::data_models::{DataURL, PaginatedResults, SymbolSearch, ExchangeById};
use serde::{Deserialize, Serialize};
use crate::utils::shard_ng::query_shard_for_value;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::types::TickerId;

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerETFHolder {
    pub ticker_id: TickerId,
    pub etf_ticker_ids_json: String,
}

impl TickerETFHolder {
    pub async fn get_ticker_etf_holders(
        symbol: &str,
        exchange_short_name: &str,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerId>, JsValue> {
        // Fetch and decompress the SymbolSearch CSV data
        let url = DataURL::SymbolSearch.value().to_owned();
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let symbol_search_results: Vec<SymbolSearch> = parse_csv_data(csv_string.as_bytes())?;

        // Fetch and decompress the ExchangeById CSV data
        let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
        let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
        let exchange_csv_string = String::from_utf8(exchange_csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let exchange_results: Vec<ExchangeById> = parse_csv_data(exchange_csv_string.as_bytes())?;

        // Find the exchange_id for the given exchange_short_name
        let exchange = exchange_results.into_iter().find(|exchange| {
            exchange.exchange_short_name.eq_ignore_ascii_case(exchange_short_name)
        });
        let exchange_id = exchange
            .ok_or_else(|| JsValue::from_str("Exchange not found"))
            .map(|e| e.exchange_id)?;

        // Find the ticker_id manually using symbol and exchange_id
        let ticker = symbol_search_results.into_iter().find(|result| {
            result.symbol.eq_ignore_ascii_case(symbol) && result.exchange_id == Some(exchange_id)
        });

        let ticker_id = ticker
            .ok_or_else(|| JsValue::from_str("Symbol not found"))
            .map(|t| t.ticker_id)?;

        let url: &str = DataURL::TickerETFHoldersShardIndex.value();

        // Query shard for the ticker_id
        let holder = query_shard_for_value(url, &ticker_id, |detail: &TickerETFHolder| Some(&detail.ticker_id))
            .await?
            .ok_or_else(|| JsValue::from_str("Symbol not found"))?;

        // Parse the ETF ticker IDs JSON
        let etf_ticker_ids: Vec<TickerId> = serde_json::from_str(&holder.etf_ticker_ids_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse etf_ticker_ids_json: {}", e)))?;

        // Paginate the results
        PaginatedResults::paginate(etf_ticker_ids, page, page_size)
    }
}
