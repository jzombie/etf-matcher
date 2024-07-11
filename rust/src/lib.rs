use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use serde_wasm_bindgen::to_value;
use std::panic;

mod utils;
mod data_models;

use crate::data_models::{
    DataBuildInfo,
    PaginatedResults,
    SymbolSearch,
    SymbolDetail,
    SymbolETFHolder,
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
pub async fn search_symbols(query: &str, page: usize, page_size: usize) -> Result<JsValue, JsValue> {
    let results: PaginatedResults<SymbolSearch> = SymbolSearch::search_symbols(query, page, page_size).await?;
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
