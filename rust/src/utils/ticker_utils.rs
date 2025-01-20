use crate::data_models::{DataURL, ExchangeById, TickerSearchResultRaw};
use crate::types::{TickerId, TickerSymbol};
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Mutex;

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
    let symbol_search_results: Vec<TickerSearchResultRaw> = parse_csv_data(csv_string.as_bytes())?;

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

// TODO: Remove
// pub async fn get_symbol_and_exchange_by_ticker_id(
//     ticker_id: TickerId,
// ) -> Result<(String, Option<String>), JsValue> {
//     // Ensure cache is preloaded
//     if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
//         .lock()
//         .unwrap()
//         .is_empty()
//     {
//         preload_symbol_and_exchange_cache().await?;
//     }

//     let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
//     cache
//         .get(&ticker_id)
//         .cloned()
//         .ok_or_else(|| JsValue::from_str("Ticker ID not found"))
// }

pub async fn get_ticker_id(ticker_symbol: TickerSymbol) -> Result<TickerId, JsValue> {
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    for (ticker_id, (cached_symbol, _cached_exchange)) in cache.iter() {
        if cached_symbol.eq_ignore_ascii_case(&ticker_symbol) {
            return Ok(*ticker_id);

            // TODO: Remove
            // if let Some(ref cached_exchange_short_name) = cached_exchange {
            //     if cached_exchange_short_name.eq_ignore_ascii_case(exchange_short_name) {
            //         return Ok(*ticker_id);
            //     }
            // }
        }
    }

    Err(JsValue::from_str("Symbol not found"))
}

pub async fn get_ticker_symbol(ticker_id: TickerId) -> Result<TickerSymbol, JsValue> {
    // Ensure cache is preloaded
    if SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE
        .lock()
        .unwrap()
        .is_empty()
    {
        preload_symbol_and_exchange_cache().await?;
    }

    let cache = SYMBOL_AND_EXCHANGE_BY_TICKER_ID_CACHE.lock().unwrap();
    for (cached_ticker_id, (ticker_symbol, _cached_exchange)) in cache.iter() {
        if *cached_ticker_id == ticker_id {
            return Ok(ticker_symbol.clone());

            // TODO: Remove
            // if let Some(ref cached_exchange_short_name) = cached_exchange {
            //     if cached_exchange_short_name.eq_ignore_ascii_case(exchange_short_name) {
            //         return Ok(*ticker_id);
            //     }
            // }
        }
    }

    Err(JsValue::from_str("Symbol not found"))
}
