use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use std::collections::HashMap;
use std::io::Read;
use flate2::read::GzDecoder;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

// Option<type> allows null values
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Entry {
    symbol: Option<String>,
    name: Option<String>,
    price: Option<f64>,
    exchange: Option<String>,
    #[serde(rename = "exchangeShortName")]
    exchange_short_name: Option<String>,
    #[serde(rename = "type")]
    entry_type: Option<String>,
}

#[wasm_bindgen]
pub fn count_entries_per_exchange() -> JsValue {
    // Include the compressed JSON data at compile time
    let compressed_data = include_bytes!("../data.json.gz");

    // Decompress the JSON data
    let mut decoder = GzDecoder::new(&compressed_data[..]);
    let mut json_data = String::new();
    if let Err(err) = decoder.read_to_string(&mut json_data) {
        alert(&format!("Failed to decompress JSON: {}", err));
        return JsValue::NULL;
    }

    // Parse the JSON data
    let entries: Vec<Entry> = match serde_json::from_str(&json_data) {
        Ok(entries) => entries,
        Err(err) => {
            alert(&format!("Failed to parse JSON: {}", err));
            return JsValue::NULL;
        }
    };

    // Count the number of entries per exchange
    let mut counts: HashMap<String, usize> = HashMap::new();
    for entry in entries {
        if let Some(exchange) = &entry.exchange {
            *counts.entry(exchange.clone()).or_insert(0) += 1;
        }
    }

    // Convert the counts to a JSON value
    match to_value(&counts) {
        Ok(js_value) => js_value,
        Err(err) => {
            alert(&format!("Failed to serialize JSON: {}", err));
            JsValue::NULL
        }
    }
}
