use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Mutex;
// use serde::{Deserialize, Serialize};
use crate::data_models::{DataURL, ExchangeById, TickerSearch};
use crate::types::TickerId;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;

lazy_static! {
    static ref SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE: Mutex<HashMap<TickerId, (String, Option<String>)>> =
        Mutex::new(HashMap::new());
}

async fn preload_symbol_and_exchange_cache() -> Result<(), JsValue> {
    // Fetch and decompress the TickerSearch CSV data
    let url = DataURL::TickerSearch.value().to_owned();
    let csv_data = fetch_and_decompress_gz(&url, true).await?;
    let csv_string = String::from_utf8(csv_data)
        .map_err(|err| JsValue::from_str(&format!("Failed to convert data to String: {}", err)))?;
    let symbol_search_results: Vec<TickerSearch> = parse_csv_data(csv_string.as_bytes())?;

    // Fetch and decompress the ExchangeById CSV data
    let exchange_url = DataURL::ExchangeByIdIndex.value().to_owned();
    let exchange_csv_data = fetch_and_decompress_gz(&exchange_url, true).await?;
    let exchange_csv_string = String::from_utf8(exchange_csv_data)
        .map_err(|err| JsValue::from_str(&format!("Failed to convert data to String: {}", err)))?;
    let exchange_results: Vec<ExchangeById> = parse_csv_data(exchange_csv_string.as_bytes())?;

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

pub async fn get_symbol_and_exchange_by_ticker_id(
    ticker_id: TickerId,
) -> Result<(String, Option<String>), JsValue> {
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    cache
        .get(&ticker_id)
        .cloned()
        .ok_or_else(|| JsValue::from_str("Ticker ID not found"))
}

pub async fn get_ticker_id(symbol: &str, exchange_short_name: &str) -> Result<TickerId, JsValue> {
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    for (ticker_id, (cached_symbol, cached_exchange)) in cache.iter() {
        if cached_symbol.eq_ignore_ascii_case(symbol) {
            if let Some(ref cached_exchange_short_name) = cached_exchange {
                if cached_exchange_short_name.eq_ignore_ascii_case(exchange_short_name) {
                    return Ok(*ticker_id);
                }
            }
        }
    }

    Err(JsValue::from_str("Symbol not found"))
}
