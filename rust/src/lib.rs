use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;
use std::panic;

mod constants;
mod data_models;
mod utils;
mod types;

use crate::types::TickerId;

use crate::data_models::{
    DataBuildInfo, DataURL, ETFAggregateDetail, PaginatedResults,
    SymbolDetail, TickerETFHolder, SymbolSearch, SymbolSearchResult,
};

use crate::data_models::image::get_image_info as lib_get_image_info;

// Rename the imported functions to avoid name conflicts
use crate::utils::cache::{
    clear_cache as lib_clear_cache, get_cache_details as lib_get_cache_details,
    get_cache_size as lib_get_cache_size, remove_cache_entry as lib_remove_cache_entry,
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
    to_value(&data).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert DataBuildInfo to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn preload_symbol_search_cache() -> Result<JsValue, JsValue> {
    SymbolSearch::preload_symbol_search_cache().await.map(|_| {
        JsValue::NULL // Returning an empty JsValue on success
    })
}

#[wasm_bindgen]
pub async fn search_symbols(
    query: &str,
    page: usize,
    page_size: usize,
    only_exact_matches: Option<bool>,
) -> Result<JsValue, JsValue> {
    let results: PaginatedResults<SymbolSearchResult> =
        SymbolSearch::search_symbols(query, page, page_size, only_exact_matches).await?;
    to_value(&results)
        .map_err(|err| JsValue::from_str(&format!("Failed to serialize results: {}", err)))
}

#[wasm_bindgen]
pub async fn get_symbol_detail(symbol: &str) -> Result<JsValue, JsValue> {
    let detail: SymbolDetail = SymbolDetail::get_symbol_detail(symbol).await?;
    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert SymbolDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_ticker_etf_holder_aggregate_detail_by_ticker_id(
    ticker_id: TickerId,
    page: usize,
    page_size: usize,
) -> Result<JsValue, JsValue> {
    let etf_ticker_ids: PaginatedResults<ETFAggregateDetail> =
    TickerETFHolder::get_ticker_etf_holder_aggregate_detail_by_ticker_id(ticker_id, page, page_size).await?;
    to_value(&etf_ticker_ids).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert PaginatedResults<ETFAggregateDetail> to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_aggregate_detail_by_ticker_id(ticker_id: TickerId) -> Result<JsValue, JsValue> {
    let etf_detail: ETFAggregateDetail =
        ETFAggregateDetail::get_etf_aggregate_detail_by_ticker_id(ticker_id).await?;
    to_value(&etf_detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert ETFAggregateDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_image_info(filename: &str) -> Result<JsValue, JsValue> {
    let image_url = DataURL::Image(filename.to_string()).image_url();
    let image_info = lib_get_image_info(&image_url).await?;
    Ok(to_value(&image_info).map_err(|e| JsValue::from_str(&e.to_string()))?)
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
