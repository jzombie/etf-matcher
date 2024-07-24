use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
// use serde::{Deserialize, Serialize};
use crate::data_models::{DataURL, SymbolSearch, ExchangeById};
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::types::TickerId;

lazy_static! {
    static ref SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE: Mutex<HashMap<TickerId, (String, Option<String>)>> = Mutex::new(HashMap::new());
}

pub async fn get_symbol_and_exchange_by_ticker_id(ticker_id: TickerId) -> Result<(String, Option<String>), JsValue> {
    {
        // Check if the result is already in the cache
        let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
        if let Some(result) = cache.get(&ticker_id) {
            return Ok(result.clone());
        }
    }

    // Fetch and decompress the SymbolSearch CSV data
    let url = DataURL::SymbolSearch.value().to_owned();
    let csv_data = fetch_and_decompress_gz(&url, true).await?;
    let csv_string = String::from_utf8(csv_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to convert data to String: {}", err))
    })?;
    let symbol_search_results: Vec<SymbolSearch> = parse_csv_data(csv_string.as_bytes())?;

    // Find the symbol and exchange_id for the given ticker_id
    let symbol_search_entry = symbol_search_results.iter().find(|result| result.ticker_id == ticker_id)
        .ok_or_else(|| JsValue::from_str("Ticker ID not found"))?;
    let symbol = symbol_search_entry.symbol.clone();
    let exchange_id = symbol_search_entry.exchange_id;

    // Fetch and decompress the ExchangeById CSV data if exchange_id is present
    let exchange_short_name = if let Some(exchange_id) = exchange_id {
        let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
        let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
        let exchange_csv_string = String::from_utf8(exchange_csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let exchange_results: Vec<ExchangeById> = parse_csv_data(exchange_csv_string.as_bytes())?;

        // Find the exchange short name for the given exchange_id
        exchange_results.iter().find(|exchange| exchange.exchange_id == exchange_id)
            .map(|exchange| exchange.exchange_short_name.clone())
    } else {
        None
    };

    let result = (symbol.clone(), exchange_short_name.clone());

    // Store the result in the cache
    {
        let mut cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
        cache.insert(ticker_id, result.clone());
    }

    Ok(result)
}

// TODO: Reimplement, with local caching
// pub async fn get_ticker_id(symbol: &str, exchange_short_name: &str) -> Result<TickerId, JsValue> {
//     // Fetch and decompress the SymbolSearch CSV data
//     let url = DataURL::SymbolSearch.value().to_owned();
//     // console::debug_1(&format!("Fetching SymbolSearch data from: {}", url).into());
//     let csv_data = fetch_and_decompress_gz(&url, true).await?;
//     let csv_string = String::from_utf8(csv_data).map_err(|err| {
//         // console::debug_1(&format!("Failed to convert SymbolSearch data to String: {}", err).into());
//         JsValue::from_str(&format!("Failed to convert data to String: {}", err))
//     })?;
//     let symbol_search_results: Vec<SymbolSearch> = parse_csv_data(csv_string.as_bytes())?;
//     // console::debug_1(&format!("Parsed {} SymbolSearch results", symbol_search_results.len()).into());

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
