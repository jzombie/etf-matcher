use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use std::panic;
use serde::{Deserialize, Serialize};
use serde::de::DeserializeOwned;
use serde_wasm_bindgen;
use serde_wasm_bindgen::to_value;
use std::collections::HashMap;

mod utils;
use utils::{fetch_and_decompress_gz, fetch_and_decompress_gz_non_cached};

mod data_url;
use data_url::DataUrl;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    web_sys::console::debug_1(&"Hello from Rust!".into());

    // Set the panic hook
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    Ok(())
}

#[derive(Serialize, Deserialize)]
struct DataBuildInfo {
    time: String,
    hash: String,
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

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ETFHolder {
    asset: Option<String>,
    name: Option<String>,
    isin: Option<String>,
    cusip: Option<String>,
    #[serde(rename = "sharesNumber")]
    shares_number: Option<f64>,
    #[serde(rename = "weightPercentage")]
    weight_percentage: Option<f64>,
    #[serde(rename = "marketValue")]
    market_value: Option<f64>,
    updated: Option<String>,
}

type SymbolList = Vec<String>;

#[wasm_bindgen]
pub async fn get_data_build_info() -> Result<JsValue, JsValue> {
    let url: &str = &DataUrl::DataBuildInfo.value();

    // Fetch and decompress the JSON data
    let json_data = fetch_and_decompress_gz_non_cached(&url).await?;
    
    // Use the `?` operator to propagate the error if `parse_json_data` fails
    let data: DataBuildInfo = parse_json_data(&json_data)?;

    // Convert the DataBuildInfo struct into a JsValue and return it
    serde_wasm_bindgen::to_value(&data).map_err(|err| {
        JsValue::from_str(&format!("Failed to convert DataBuildInfo to JsValue: {}", err))
    })
}

// TODO: For the following, if there is a decompression error, bust the cache and
// try again

#[wasm_bindgen]
pub async fn get_symbols() -> Result<JsValue, JsValue> {
    let url: &str = &DataUrl::SymbolList.value();

    // Fetch and decompress the JSON data
    let json_data = fetch_and_decompress_gz(&url).await?;
    
    // Parse the JSON data into a SymbolList
    let symbols: SymbolList = serde_json::from_str(&json_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to parse JSON data: {}", err))
    })?;
    
    // Convert the SymbolList into a JsValue and return it using serde-wasm-bindgen
    serde_wasm_bindgen::to_value(&symbols).map_err(|err| {
        JsValue::from_str(&format!("Failed to convert symbols to JsValue: {}", err))
    })
}


#[wasm_bindgen]
pub async fn count_etfs_per_exchange() -> Result<JsValue, JsValue> {
    let url: &str = &DataUrl::EtfList.value();

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
pub async fn get_etf_holder_asset_count(symbol: String) -> Result<JsValue, JsValue> {
    let url = DataUrl::get_etf_holder_url(&symbol);

    let json_data = fetch_and_decompress_gz(&url).await?;
    let entries: Vec<ETFHolder> = parse_json_data(&json_data)?;

    let mut count = 0;
    for entry in entries {
        if entry.asset.is_some() {
            count += 1;
        }
    }

    Ok(JsValue::from(count))
}

#[wasm_bindgen]
pub async fn get_etf_holder_asset_names(symbol: String) -> Result<JsValue, JsValue> {
    let url = DataUrl::get_etf_holder_url(&symbol);

    let json_data = fetch_and_decompress_gz(&url).await?;
    let entries: Vec<ETFHolder> = parse_json_data(&json_data)?;

    let mut asset_names: Vec<String> = Vec::new();
    for entry in entries {
        if let Some(asset) = &entry.asset {
            asset_names.push(asset.clone());
        }
    }

    to_value(&asset_names).map_err(|err| {
        JsValue::from_str(&format!("Failed to serialize asset names: {}", err))
    })
}

// Generic function to parse JSON data into any type that implements Deserialize
fn parse_json_data<T: DeserializeOwned>(json_data: &str) -> Result<T, JsValue> {
    serde_json::from_str(json_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to parse JSON: {}", err))
    })
}
