use crate::data_models::{DataURL, PaginatedResults, SymbolSearch, ExchangeById};
use serde::{Deserialize, Serialize};
use crate::utils::shard_ng::query_shard_for_value;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::types::TickerId;
use web_sys::console;

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
        // Log the start of the function
        console::log_1(&format!("Fetching ticker ETF holders for symbol: {}, exchange: {}", symbol, exchange_short_name).into());

        // Fetch and decompress the SymbolSearch CSV data
        let url = DataURL::SymbolSearch.value().to_owned();
        console::log_1(&format!("Fetching SymbolSearch data from: {}", url).into());
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            console::log_1(&format!("Failed to convert SymbolSearch data to String: {}", err).into());
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let symbol_search_results: Vec<SymbolSearch> = parse_csv_data(csv_string.as_bytes())?;
        console::log_1(&format!("Parsed {} SymbolSearch results", symbol_search_results.len()).into());

        // Fetch and decompress the ExchangeById CSV data
        let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
        console::log_1(&format!("Fetching ExchangeById data from: {}", exchange_url).into());
        let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
        let exchange_csv_string = String::from_utf8(exchange_csv_data).map_err(|err| {
            console::log_1(&format!("Failed to convert ExchangeById data to String: {}", err).into());
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let exchange_results: Vec<ExchangeById> = parse_csv_data(exchange_csv_string.as_bytes())?;
        console::log_1(&format!("Parsed {} ExchangeById results", exchange_results.len()).into());

        // Find all exchange_ids for the given exchange_short_name
        console::log_1(&format!("Looking up exchange_ids for exchange_short_name: {}", exchange_short_name).into());
        let exchange_ids: Vec<TickerId> = exchange_results.iter()
            .filter(|exchange| exchange.exchange_short_name.eq_ignore_ascii_case(exchange_short_name))
            .map(|exchange| exchange.exchange_id)
            .collect();

        if exchange_ids.is_empty() {
            console::log_1(&format!("Exchange not found for short name: {}", exchange_short_name).into());
            return Err(JsValue::from_str("Exchange not found"));
        }

        console::log_1(&format!("Found exchange_ids: {:?}", exchange_ids).into());

        // Find the ticker_id manually using symbol and any of the matching exchange_ids
        console::log_1(&format!("Looking up ticker_id for symbol: {}", symbol).into());
        let ticker = symbol_search_results.iter().find(|result| {
            console::log_1(&format!("Checking symbol: {}, exchange_id: {:?}", result.symbol, result.exchange_id).into());
            result.symbol.eq_ignore_ascii_case(symbol) && result.exchange_id.map_or(false, |id| exchange_ids.contains(&id))
        });

        let ticker_id = ticker
            .ok_or_else(|| {
                console::log_1(&format!("Symbol not found for symbol: {}, exchange_ids: {:?}", symbol, exchange_ids).into());
                JsValue::from_str("Symbol not found")
            })
            .map(|t| t.ticker_id)?;

        console::log_1(&format!("Found ticker_id: {}", ticker_id).into());

        let url: &str = DataURL::TickerETFHoldersShardIndex.value();

        // Query shard for the ticker_id
        console::log_1(&format!("Querying shard for ticker_id: {}", ticker_id).into());
        let holder = query_shard_for_value(url, &ticker_id, |detail: &TickerETFHolder| Some(&detail.ticker_id))
            .await?
            .ok_or_else(|| {
                console::log_1(&format!("Symbol not found in shard for ticker_id: {}", ticker_id).into());
                JsValue::from_str("Symbol not found")
            })?;

        console::log_1(&format!("Found holder for ticker_id: {}", ticker_id).into());

        // Parse the ETF ticker IDs JSON
        console::log_1(&format!("Parsing ETF ticker IDs JSON for ticker_id: {}", ticker_id).into());
        let etf_ticker_ids: Vec<TickerId> = serde_json::from_str(&holder.etf_ticker_ids_json)
            .map_err(|e| {
                console::log_1(&format!("Failed to parse etf_ticker_ids_json for ticker_id: {}: {}", ticker_id, e).into());
                JsValue::from_str(&format!("Failed to parse etf_ticker_ids_json: {}", e))
            })?;

        // Paginate the results
        console::log_1(&format!("Paginating results for ticker_id: {}", ticker_id).into());
        let paginated_results = PaginatedResults::paginate(etf_ticker_ids, page, page_size)?;

        console::log_1(&format!("Returning paginated results for ticker_id: {}", ticker_id).into());
        Ok(paginated_results)
    }
}
