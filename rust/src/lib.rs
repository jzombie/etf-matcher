use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use serde_wasm_bindgen::to_value;
use std::panic;

mod constants;
mod utils;
mod data_models;

use crate::data_models::{
    DataURL,
    DataBuildInfo,
    SymbolById,
    PaginatedResults,
    SymbolSearch,
    SymbolDetail,
    SymbolETFHolder,
    ETFAggregateDetail,
};

use crate::data_models::image::get_image_base64 as lib_get_image_base64;

// Rename the imported functions to avoid name conflicts
use crate::utils::fetch::{
    get_cache_size as lib_get_cache_size,
    get_cache_details as lib_get_cache_details,
    remove_cache_entry as lib_remove_cache_entry,
    clear_cache as lib_clear_cache
};

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
pub async fn get_symbol_by_id(ticker_id: i32) -> Result<JsValue, JsValue> {
    let data: SymbolById = SymbolById::get_symbol_by_id(ticker_id).await?;
    to_value(&data).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert SymbolById to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn search_symbols(query: &str, page: usize, page_size: usize, only_exact_matches: Option<bool>) -> Result<JsValue, JsValue> {
    let results: PaginatedResults<SymbolSearch> = SymbolSearch::search_symbols(query, page, page_size, only_exact_matches).await?;
    to_value(&results).map_err(|err| JsValue::from_str(&format!("Failed to serialize results: {}", err)))
}

#[wasm_bindgen]
pub async fn get_symbol_detail(symbol: &str) -> Result<JsValue, JsValue> {
    let detail: SymbolDetail = SymbolDetail::get_symbol_detail(symbol).await?;
    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert SymbolDetail to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn get_symbol_etf_holders(symbol: &str, page: usize, page_size: usize) -> Result<JsValue, JsValue> {
    let etf_symbols: PaginatedResults<String> = SymbolETFHolder::get_symbol_etf_holders(symbol, page, page_size).await?;
    to_value(&etf_symbols).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert Vec<String> to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn get_etf_aggregate_detail(etf_symbol: &str) -> Result<JsValue, JsValue> {
    let etf_detail: ETFAggregateDetail = ETFAggregateDetail::get_etf_aggregate_detail(etf_symbol).await?;
    to_value(&etf_detail).map_err(|err: serde_wasm_bindgen::Error| JsValue::from_str(&format!("Failed to convert ETFAggregateDetail to JsValue: {}", err)))
}

#[wasm_bindgen]
pub async fn get_image_base64(filename: &str) -> Result<JsValue, JsValue> {
    let image_url = DataURL::Image(filename.to_string()).image_url();
    let base64_data = lib_get_image_base64(&image_url).await?;
    Ok(JsValue::from_str(&base64_data))
}

#[wasm_bindgen]
pub fn get_cache_size() -> usize {
    lib_get_cache_size()
}

#[wasm_bindgen]
pub fn get_cache_details() -> JsValue {
    lib_get_cache_details()
}

#[wasm_bindgen]
pub fn remove_cache_entry(key: &str) {
    lib_remove_cache_entry(key);
}

#[wasm_bindgen]
pub fn clear_cache() {
    lib_clear_cache();
}
