// TODO: This entire file can likely be removed; moving all functionality to `ticker_search` and skipping the duplicate cache

use crate::data_models::{DataURL, Exchange, TickerSearchResultRaw};
use crate::types::{TickerId, TickerSymbol};
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Mutex;

// TODO: Remove
lazy_static! {
    static ref SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE: Mutex<HashMap<TickerId, (String, Option<String>)>> =
        Mutex::new(HashMap::new());
}

// TODO: Remove
async fn preload_symbol_and_exchange_cache() -> Result<(), JsValue> {
    // Fetch and decompress the TickerSearch CSV data
    let url = DataURL::TickerSearch.value().to_owned();
    let csv_data = fetch_and_decompress_gz(&url, true).await?;
    let csv_string = String::from_utf8(csv_data)
        .map_err(|err| JsValue::from_str(&format!("Failed to convert data to String: {}", err)))?;
    let symbol_search_results: Vec<TickerSearchResultRaw> = parse_csv_data(csv_string.as_bytes())?;

    // Fetch and decompress the Exchange CSV data
    let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
    let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
    let exchange_csv_string = String::from_utf8(exchange_csv_data)
        .map_err(|err| JsValue::from_str(&format!("Failed to convert data to String: {}", err)))?;
    let exchange_results: Vec<Exchange> = parse_csv_data(exchange_csv_string.as_bytes())?;

    let exchange_map: HashMap<TickerId, String> = exchange_results
        .into_iter()
        .map(|exchange| (exchange.exchange_id, exchange.exchange_short_name))
        .collect();

    let mut cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();

    for entry in symbol_search_results {
        let exchange_short_name = entry
            .exchange_id
            .and_then(|id| exchange_map.get(&id).cloned());
        cache.insert(entry.ticker_id, (entry.symbol.clone(), exchange_short_name));
    }

    Ok(())
}

// TODO: Move to `ticker_search` and skip the duplicate cache
pub async fn get_ticker_id(ticker_symbol: TickerSymbol) -> Result<TickerId, JsValue> {
    // TODO: Remove `unwrap`
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    // TODO: Remove `unwrap`
    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    for (ticker_id, (cached_symbol, _cached_exchange)) in cache.iter() {
        if cached_symbol.eq_ignore_ascii_case(&ticker_symbol) {
            return Ok(*ticker_id);
        }
    }

    Err(JsValue::from_str("Symbol not found"))
}

// TODO: Move to `ticker_search` and skip the duplicate cache
pub async fn get_ticker_symbol(ticker_id: TickerId) -> Result<TickerSymbol, JsValue> {
    // TODO: Remove `unwrap`
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    // TODO: Remove `unwrap`
    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    for (cached_ticker_id, (ticker_symbol, _cached_exchange)) in cache.iter() {
        if *cached_ticker_id == ticker_id {
            return Ok(ticker_symbol.clone());
        }
    }

    Err(JsValue::from_str("Symbol not found"))
}

pub async fn get_ticker_symbol_map() -> Result<HashMap<TickerSymbol, TickerId>, JsValue> {
    // TODO: Remove `unwrap`
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    // TODO: Remove `unwrap`
    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    let symbol_map: HashMap<TickerSymbol, TickerId> = cache
        .iter()
        .map(|(ticker_id, (symbol, _exchange))| (symbol.clone(), *ticker_id))
        .collect();

    Ok(symbol_map)
}
