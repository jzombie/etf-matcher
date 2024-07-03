use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use std::panic;
use serde::{Deserialize, Serialize};
use serde::de::DeserializeOwned;
use serde_wasm_bindgen::to_value;
use std::collections::HashMap;

mod utils;
use utils::fetch_and_decompress_gz;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    // Set the panic hook
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    Ok(())
}

// https://financialmodelingprep.com/api/v3/etf/list
const ETF_URL: &str = "/data/etfs.enc";


// TODO: Encode w/ symbol
// https://financialmodelingprep.com/api/v3/etf-holder/{ETF_SYMBOL}
fn get_etf_holder_url(symbol: &str) -> String {
    format!("/data/etf_holder.{}.enc", symbol)
}

// #[wasm_bindgen]
// extern {
//     pub fn alert(s: &str);
// }

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

#[wasm_bindgen]
pub async fn count_etfs_per_exchange() -> Result<JsValue, JsValue> {
    let url: &str = ETF_URL;

    let json_data = fetch_and_decompress_gz(&url).await?;
    let entries: Vec<ETF> = parse_json_data(&json_data)?;
    
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
pub async fn get_etf_holder(symbol: String) -> Result<JsValue, JsValue> {
    web_sys::console::log_1(&"Starting get_etf_holder".into());

    // Log the received symbol
    web_sys::console::log_1(&format!("Received symbol: {}", symbol).into());

    // Generate the URL
    let url = get_etf_holder_url(&symbol);
    web_sys::console::log_1(&format!("Generated URL: {}", url).into());

    // Convert the URL to JsValue and return
    let js_url = JsValue::from_str(&url);
    web_sys::console::log_1(&format!("JsValue URL: {:?}", js_url).into());

    Ok(js_url)
}



// Generic function to parse JSON data into any type that implements Deserialize
fn parse_json_data<T: DeserializeOwned>(json_data: &str) -> Result<T, JsValue> {
    serde_json::from_str(json_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to parse JSON: {}", err))
    })
}
