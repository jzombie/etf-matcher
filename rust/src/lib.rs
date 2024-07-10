use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use serde_wasm_bindgen::to_value;
use std::panic;

mod utils;
mod data_models;

use data_models::{
    DataBuildInfo, ETF, ETFHolder, SymbolList, SymbolSearch, SymbolDetail,
};
use crate::data_models::SymbolListExt;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    web_sys::console::debug_1(&"Hello from Rust!".into());
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    Ok(())
}

#[wasm_bindgen]
pub async fn get_data_build_info() -> Result<JsValue, JsValue> {
    let data: DataBuildInfo = DataBuildInfo::get_data_build_info().await?;
    to_value(&data).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert DataBuildInfo to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn get_symbols() -> Result<JsValue, JsValue> {
    let symbols: Vec<String> = SymbolList::get_symbols().await?;
    to_value(&symbols).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert SymbolList to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn search_symbols(query: &str) -> Result<JsValue, JsValue> {
    let symbols: Vec<String> = SymbolList::search_symbols(query).await?;
    to_value(&symbols).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert SymbolList to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn search_symbols_v2(query: &str) -> Result<JsValue, JsValue> {
    let symbols: Vec<SymbolSearch> = SymbolSearch::search_symbols_v2(query).await?;
    to_value(&symbols).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to serialize symbols: {}", err)))
}

#[wasm_bindgen]
pub async fn get_symbol_detail(symbol: &str) -> Result<JsValue, JsValue> {
    let detail: SymbolDetail = SymbolDetail::get_symbol_detail(symbol).await?;
    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert SymbolDetail to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn count_etfs_per_exchange() -> Result<JsValue, JsValue> {
    let counts: std::collections::HashMap<String, usize> = ETF::count_etfs_per_exchange().await?;
    to_value(&counts).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert ETF counts to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn get_etf_holder_asset_count(symbol: String) -> Result<JsValue, JsValue> {
    let count: i32 = ETFHolder::get_etf_holder_asset_count(symbol).await?;
    Ok(JsValue::from(count))
}

#[wasm_bindgen]
pub async fn get_etf_holder_asset_names(symbol: String) -> Result<JsValue, JsValue> {
    let asset_names: Vec<String> = ETFHolder::get_etf_holder_asset_names(symbol).await?;
    to_value(&asset_names).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to serialize asset names: {}", err)))
}
