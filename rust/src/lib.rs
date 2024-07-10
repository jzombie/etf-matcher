use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use serde_wasm_bindgen;
use serde_wasm_bindgen::to_value;
use std::panic;

mod utils;

mod data_models;
use data_models::{
    DataBuildInfo,
    ETF,
    ETFHolder,
    SymbolList,
    SymbolSearch,
    SymbolDetail,
};
use crate::data_models::SymbolListExt;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    web_sys::console::debug_1(&"Hello from Rust!".into());

    // Set the panic hook
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    Ok(())
}

#[wasm_bindgen]
pub async fn get_data_build_info() -> Result<JsValue, JsValue> {   
    let data: DataBuildInfo = DataBuildInfo::get_data_build_info().await?;

    // Convert the DataBuildInfo struct into a JsValue and return it
    serde_wasm_bindgen::to_value(&data).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!("Failed to convert DataBuildInfo to JsValue: {}", err))
    })
}

// TODO: For the following, if there is a decompression error, bust the cache and
// try again

#[wasm_bindgen]
pub async fn get_symbols() -> Result<JsValue, JsValue> {
    SymbolList::get_symbols().await
        .map(|symbols| serde_wasm_bindgen::to_value(&symbols).unwrap_or_else(JsValue::from))
        .map_err(JsValue::from)
}

#[wasm_bindgen]
pub async fn search_symbols(query: &str) -> Result<JsValue, JsValue> {
    SymbolList::search_symbols(query).await
        .map(|symbols| serde_wasm_bindgen::to_value(&symbols).unwrap_or_else(JsValue::from))
        .map_err(JsValue::from)
}

#[wasm_bindgen]
pub async fn search_symbols_v2(query: &str) -> Result<JsValue, JsValue> {
    match SymbolSearch::search_symbols_v2(query).await {
        Ok(symbols) => serde_wasm_bindgen::to_value(&symbols).map_err(|err| {
            JsValue::from_str(&format!("Failed to serialize symbols: {}", err))
        }),
        Err(err) => Err(err),
    }
}


#[wasm_bindgen]
pub async fn get_symbol_detail(symbol: &str) -> Result<JsValue, JsValue> {
    match SymbolDetail::get_symbol_detail(symbol).await {
        Ok(detail) => Ok(serde_wasm_bindgen::to_value(&detail).unwrap_or_else(JsValue::from)),
        Err(err) => Err(err),
    }
}

#[wasm_bindgen]
pub async fn count_etfs_per_exchange() -> Result<JsValue, JsValue> {
    ETF::count_etfs_per_exchange().await
        .map(|counts: std::collections::HashMap<String, usize>| serde_wasm_bindgen::to_value(&counts).unwrap_or_else(JsValue::from))
        .map_err(JsValue::from)
}


#[wasm_bindgen]
pub async fn get_etf_holder_asset_count(symbol: String) -> Result<JsValue, JsValue> {
    let count: i32 = ETFHolder::get_etf_holder_asset_count(symbol).await?;

    Ok(JsValue::from(count))
}

#[wasm_bindgen]
pub async fn get_etf_holder_asset_names(symbol: String) -> Result<JsValue, JsValue> {
    let asset_names: Vec<String> = ETFHolder::get_etf_holder_asset_names(symbol).await?;

    to_value(&asset_names).map_err(|err| {
        JsValue::from_str(&format!("Failed to serialize asset names: {}", err))
    })
}
