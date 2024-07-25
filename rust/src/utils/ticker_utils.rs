use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
// use serde::{Deserialize, Serialize};
use crate::data_models::{DataURL, TickerSearch, ExchangeById};
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::types::TickerId;

lazy_static! {
    static ref SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE: Mutex<HashMap<TickerId, (String, Option<String>)>> = Mutex::new(HashMap::new());
}

async fn preload_symbol_and_exchange_cache() -> Result<(), JsValue> {
    // Fetch and decompress the TickerSearch CSV data
    let url = DataURL::TickerSearch.value().to_owned();
    let csv_data = fetch_and_decompress_gz(&url, true).await?;
    let csv_string = String::from_utf8(csv_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to convert data to String: {}", err))
    })?;
    let symbol_search_results: Vec<TickerSearch> = parse_csv_data(csv_string.as_bytes())?;

    // Fetch and decompress the ExchangeById CSV data
    let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
    let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
    let exchange_csv_string = String::from_utf8(exchange_csv_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to convert data to String: {}", err))
    })?;
    let exchange_results: Vec<ExchangeById> = parse_csv_data(exchange_csv_string.as_bytes())?;

    let exchange_map: HashMap<TickerId, String> = exchange_results
        .into_iter()
        .map(|exchange| (exchange.exchange_id, exchange.exchange_short_name))
        .collect();

    let mut cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();

    for entry in symbol_search_results {
        let exchange_short_name = entry.exchange_id.and_then(|id| exchange_map.get(&id).cloned());
        cache.insert(entry.ticker_id, (entry.symbol.clone(), exchange_short_name));
    }

    Ok(())
}

pub async fn get_symbol_and_exchange_by_ticker_id(ticker_id: TickerId) -> Result<(String, Option<String>), JsValue> {
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap().is_empty() {
        preload_symbol_and_exchange_cache().await?;
    }

    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    cache.get(&ticker_id)
        .cloned()
        .ok_or_else(|| JsValue::from_str("Ticker ID not found"))
}

// TODO: Reimplement, with local caching
// pub async fn get_ticker_id(symbol: &str, exchange_short_name: &str) -> Result<TickerId, JsValue> {
//     // Fetch and decompress the TickerSearch CSV data
//     let url = DataURL::TickerSearch.value().to_owned();
//     // console::debug_1(&format!("Fetching TickerSearch data from: {}", url).into());
//     let csv_data = fetch_and_decompress_gz(&url, true).await?;
//     let csv_string = String::from_utf8(csv_data).map_err(|err| {
//         // console::debug_1(&format!("Failed to convert TickerSearch data to String: {}", err).into());
//         JsValue::from_str(&format!("Failed to convert data to String: {}", err))
//     })?;
//     let symbol_search_results: Vec<TickerSearch> = parse_csv_data(csv_string.as_bytes())?;
//     // console::debug_1(&format!("Parsed {} TickerSearch results", symbol_search_results.len()).into());

//     // Fetch and decompress the ExchangeById CSV data
//     let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
//     // console::debug_1(&format!("Fetching ExchangeById data from: {}", exchange_url).into());
//     let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
//     let exchange_csv_string = String::from_utf8(exchange_csv_data).map_err(|err| {
//         // console::debug_1(&format!("Failed to convert ExchangeById data to String: {}", err).into());
//         JsValue::from_str(&format!("Failed to convert data to String: {}", err))
//     })?;
//     let exchange_results: Vec<ExchangeById> = parse_csv_data(exchange_csv_string.as_bytes())?;
//     // console::debug_1(&format!("Parsed {} ExchangeById results", exchange_results.len()).into());

//     // Find all exchange_ids for the given exchange_short_name
//     // console::debug_1(&format!("Looking up exchange_ids for exchange_short_name: {}", exchange_short_name).into());
//     let exchange_ids: Vec<TickerId> = exchange_results.iter()
//         .filter(|exchange| exchange.exchange_short_name.eq_ignore_ascii_case(exchange_short_name))
//         .map(|exchange| exchange.exchange_id)
//         .collect();

//     if exchange_ids.is_empty() {
//         // console::debug_1(&format!("Exchange not found for short name: {}", exchange_short_name).into());
//         return Err(JsValue::from_str("Exchange not found"));
//     }

//     // console::debug_1(&format!("Found exchange_ids: {:?}", exchange_ids).into());

//     // Find the ticker_id manually using symbol and any of the matching exchange_ids
//     // console::debug_1(&format!("Looking up ticker_id for symbol: {}", symbol).into());
//     let ticker = symbol_search_results.iter().find(|result| {
//         // console::debug_1(&format!("Checking symbol: {}, exchange_id: {:?}", result.symbol, result.exchange_id).into());
//         result.symbol.eq_ignore_ascii_case(symbol) && result.exchange_id.map_or(false, |id| exchange_ids.contains(&id))
//     });

//     let ticker_id = ticker
//         .ok_or_else(|| {
//             // console::debug_1(&format!("Symbol not found for symbol: {}, exchange_ids: {:?}", symbol, exchange_ids).into());
//             JsValue::from_str("Symbol not found")
//         })
//         .map(|t| t.ticker_id)?;

//     // console::debug_1(&format!("Found ticker_id: {}", ticker_id).into());

//     Ok(ticker_id)
// }
