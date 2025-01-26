use crate::types::ExchangeId;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::DataURL;
use crate::JsValue;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

lazy_static! {
    static ref EXCHANGE_SHORT_NAME_BY_ID_CACHE: Mutex<HashMap<ExchangeId, String>> =
        Mutex::new(HashMap::new());
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Exchange {
    pub exchange_id: ExchangeId,
    pub exchange_short_name: String,
    pub exchange_name: String,
}

impl Exchange {
    pub async fn get_short_name_by_exchange_id(exchange_id: ExchangeId) -> Result<String, JsValue> {
        // Ensure cache is preloaded
        if EXCHANGE_SHORT_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
            Self::preload_exchange_short_name_cache().await?;
        }

        // Check if the result is already in the cache
        let cache = EXCHANGE_SHORT_NAME_BY_ID_CACHE.lock().unwrap();
        if let Some(short_name) = cache.get(&exchange_id) {
            return Ok(short_name.clone());
        }

        Err(JsValue::from_str(&format!(
            "Exchange ID {} not found",
            exchange_id
        )))
    }

    async fn preload_exchange_short_name_cache() -> Result<(), JsValue> {
        // Fetch and decompress the CSV data
        let url = DataURL::ExchangeByIdIndex.value();
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<Exchange> = parse_csv_data(csv_string.as_bytes())?;

        // Load data into cache
        let mut cache = EXCHANGE_SHORT_NAME_BY_ID_CACHE.lock().unwrap();
        for exchange in data {
            cache.insert(exchange.exchange_id, exchange.exchange_short_name);
        }

        Ok(())
    }
}
