use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use std::collections::HashMap;

mod utils;
use utils::fetch_and_decompress_gz;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

// Option<type> allows null values
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ETF {
    symbol: Option<String>,
    name: Option<String>,
    price: Option<f64>,
    exchange: Option<String>,
    #[serde(rename = "exchangeShortName")]
    exchange_short_name: Option<String>,
    #[serde(rename = "type")]
    entry_type: Option<String>,
}



// Function to count entries per exchange
fn count_etfs(entries: Vec<ETF>) -> Result<JsValue, JsValue> {
    let mut counts: HashMap<String, usize> = HashMap::new();
    for entry in entries {
        if let Some(exchange) = &entry.exchange {
            *counts.entry(exchange.clone()).or_insert(0) += 1;
        }
    }
    to_value(&counts).map_err(|err| {
        JsValue::from_str(&format!("Failed to serialize JSON: {}", err))
    })
}

#[wasm_bindgen]
pub async fn count_etfs_per_exchange(url: String) -> Result<JsValue, JsValue> {
    let json_data = fetch_and_decompress_gz(&url).await?;
    let entries = parse_json_data(&json_data)?;
    count_etfs(entries)
}


// Function to parse JSON data into entries
fn parse_json_data(json_data: &str) -> Result<Vec<ETF>, JsValue> {
    serde_json::from_str(json_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to parse JSON: {}", err))
    })
}
