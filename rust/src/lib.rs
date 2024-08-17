extern crate flatbuffers as fb;
use qrcode_generator::QrCodeEcc;
use serde_wasm_bindgen::to_value;
use std::panic;
use wasm_bindgen::prelude::*;

include!("data_models/flatbuffers/financial_vectors.tenk_generated.rs");

use crate::financial_vectors::ten_k::root_as_ticker_vectors;

mod constants;
mod data_models;
mod types;
mod utils;

use crate::types::TickerId;

use crate::data_models::{
    DataBuildInfo, DataURL, ETFAggregateDetail, ETFAggregateDetailResponse, ETFHoldingTicker,
    ETFHoldingTickerResponse, ETFHoldingWeightResponse, IndustryById, PaginatedResults, SectorById,
    Ticker10KDetail, TickerDetail, TickerDetailResponse, TickerETFHolder, TickerSearch,
    TickerSearchResult
};

use crate::data_models::image::get_image_info as lib_get_image_info;

// Rename the imported functions to avoid name conflicts
use crate::utils::network_cache::{
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
pub fn generate_qr_code(data: &str) -> Result<JsValue, JsValue> {
    let result =
        qrcode_generator::to_svg_to_string(data, QrCodeEcc::Low, 1024, None::<&str>).unwrap();
    to_value(&result).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!("Failed to generate QR code: {}", err))
    })
}

#[wasm_bindgen]
pub async fn get_symbol_and_exchange_by_ticker_id(ticker_id: TickerId) -> Result<JsValue, JsValue> {
    let result: (String, Option<String>) =
        utils::ticker_utils::get_symbol_and_exchange_by_ticker_id(ticker_id).await?;
    to_value(&result).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!("Failed to convert result to JsValue: {}", err))
    })
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
    TickerSearch::preload_symbol_search_cache().await.map(|_| {
        JsValue::NULL // Returning an empty JsValue on success
    })
}

#[wasm_bindgen]
pub async fn search_tickers(
    query: &str,
    page: usize,
    page_size: usize,
    only_exact_matches: Option<bool>,
) -> Result<JsValue, JsValue> {
    let results: PaginatedResults<TickerSearchResult> =
        TickerSearch::search_tickers(query, page, page_size, only_exact_matches).await?;
    to_value(&results)
        .map_err(|err| JsValue::from_str(&format!("Failed to serialize results: {}", err)))
}

#[wasm_bindgen]
pub async fn get_ticker_detail(ticker_id: TickerId) -> Result<JsValue, JsValue> {
    let detail: TickerDetailResponse = TickerDetail::get_ticker_detail(ticker_id).await?;
    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert TickerDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_ticker_10k_detail(ticker_id: TickerId) -> Result<JsValue, JsValue> {
    let detail: Ticker10KDetail =
        Ticker10KDetail::get_ticker_10k_detail_by_ticker_id(ticker_id).await?;
    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert Ticker10KDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_holders_aggregate_detail_by_ticker_id(
    ticker_id: TickerId,
    page: usize,
    page_size: usize,
) -> Result<JsValue, JsValue> {
    let paginated_etf_aggregate_details: PaginatedResults<ETFAggregateDetailResponse> =
        TickerETFHolder::get_etf_holders_aggregate_detail_by_ticker_id(ticker_id, page, page_size)
            .await?;
    to_value(&paginated_etf_aggregate_details).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert PaginatedResults<ETFAggregateDetail> to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_aggregate_detail_by_ticker_id(
    ticker_id: TickerId,
) -> Result<JsValue, JsValue> {
    let etf_detail: ETFAggregateDetailResponse =
        ETFAggregateDetail::get_etf_aggregate_detail_by_ticker_id(ticker_id).await?;
    to_value(&etf_detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert ETFAggregateDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_holdings_by_etf_ticker_id(
    etf_ticker_id: TickerId,
    page: usize,
    page_size: usize,
) -> Result<JsValue, JsValue> {
    let etf_holding_tickers: PaginatedResults<ETFHoldingTickerResponse> =
        ETFHoldingTicker::get_etf_holdings_by_etf_ticker_id(etf_ticker_id, page, page_size).await?;
    to_value(&etf_holding_tickers).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert <PaginatedResults<ETFHoldingTickerResponse> to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_holding_weight(
    etf_ticker_id: TickerId,
    holding_ticker_id: TickerId,
) -> Result<JsValue, JsValue> {
    let etf_holding_weight: ETFHoldingWeightResponse =
        ETFHoldingTicker::get_etf_holding_weight(etf_ticker_id, holding_ticker_id).await?;
    to_value(&etf_holding_weight).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert ETFHoldingWeightResponse to JsValue: {}",
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
pub async fn get_ticker_id(symbol: &str, exchange_short_name: &str) -> Result<JsValue, JsValue> {
    let ticker_id: TickerId =
        utils::ticker_utils::get_ticker_id(symbol, exchange_short_name).await?;
    Ok(to_value(&ticker_id).map_err(|e| JsValue::from_str(&e.to_string()))?)
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

/// TODO: Refactor the following as needed

#[wasm_bindgen]
pub async fn proto_echo_all_ticker_vectors() -> Result<(), JsValue> {
    // Fetch the ticker vectors binary data using `xhr_fetch`
    let url = "/data/financial_vectors.tenk.bin";

    let file_content = utils::xhr_fetch_cached(url.to_string()).await
        .map_err(|err| JsValue::from_str(&format!("Failed to fetch file: {:?}", err)))?;

    // Use the FlatBuffers `root_as_ticker_vectors` function to parse the buffer
    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| JsValue::from_str(&format!("Failed to parse TickerVectors: {:?}", err)))?;

    // Get the vectors, which is an Option containing a flatbuffers::Vector
    if let Some(vectors) = ticker_vectors.vectors() {
        // Loop through each ticker vector in the Vector and log it to the web console
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            web_sys::console::log_1(&format!("Ticker Vector {}: {:?}", i, ticker_vector).into());
        }
    } else {
        web_sys::console::log_1(&"No ticker vectors found.".into());
    }

    Ok(())
}

#[wasm_bindgen]
pub async fn proto_get_ticker_vector(ticker_id: i32) -> Result<JsValue, JsValue> {
    // Fetch the ticker vectors binary data using `xhr_fetch`
    let url = "/data/financial_vectors.tenk.bin";

    let file_content = utils::xhr_fetch_cached(url.to_string()).await
        .map_err(|err| JsValue::from_str(&format!("Failed to fetch file: {:?}", err)))?;

    // Use the FlatBuffers `root_as_ticker_vectors` function to parse the buffer
    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| JsValue::from_str(&format!("Failed to parse TickerVectors: {:?}", err)))?;

    // Get the vectors, which is an Option containing a flatbuffers::Vector
    if let Some(vectors) = ticker_vectors.vectors() {
        // Loop through each ticker vector in the Vector
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            if ticker_vector.ticker_id() == ticker_id {
                // Convert the vector to a JS array and return it
                let js_array = js_sys::Array::new();
                if let Some(vector_data) = ticker_vector.vector() {
                    for j in 0..vector_data.len() {
                        js_array.push(&JsValue::from_f64(vector_data.get(j) as f64));
                    }
                }
                return Ok(js_array.into());
            }
        }
    }

    // If the ticker_id was not found, return an error
    Err(JsValue::from_str("Ticker ID not found"))
}

#[wasm_bindgen]
pub async fn proto_find_closest_ticker_ids(ticker_id: i32) -> Result<JsValue, JsValue> {
    // Fetch the ticker vectors binary data using `xhr_fetch`
    let url = "/data/financial_vectors.tenk.bin";

    let file_content = utils::xhr_fetch_cached(url.to_string()).await
        .map_err(|err| JsValue::from_str(&format!("Failed to fetch file: {:?}", err)))?;

    // Use the FlatBuffers `root_as_ticker_vectors` function to parse the buffer
    let ticker_vectors = root_as_ticker_vectors(&file_content)
        .map_err(|err| JsValue::from_str(&format!("Failed to parse TickerVectors: {:?}", err)))?;

    // Find the target vector and PCA coordinates corresponding to the given ticker_id
    let mut target_vector: Option<flatbuffers::Vector<'_, f32>> = None;
    let mut target_pca_coordinates: Option<flatbuffers::Vector<'_, f32>> = None;

    if let Some(vectors) = ticker_vectors.vectors() {
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            if ticker_vector.ticker_id() == ticker_id {
                target_vector = ticker_vector.vector();
                target_pca_coordinates = ticker_vector.pca_coordinates();
                break;
            }
        }
    }

    let target_vector = match target_vector {
        Some(vector) => vector,
        None => return Err(JsValue::from_str("Ticker ID not found")),
    };

    let target_pca_coordinates = match target_pca_coordinates {
        Some(coords) => coords,
        None => return Err(JsValue::from_str("PCA coordinates not found for the given Ticker ID")),
    };

    // Convert target PCA coordinates to Vec<f64> for arithmetic operations
    let target_pca_coords: Vec<f64> = target_pca_coordinates.iter().map(|c| c as f64).collect();

    // TODO: Update types (TickerId, f32, Vec<f32>)
    // Compute Euclidean distance with every other vector and capture PCA coordinates
    let mut results: Vec<(i32, f64, Vec<f64>, Vec<f64>)> = Vec::new();
    if let Some(vectors) = ticker_vectors.vectors() {
        for i in 0..vectors.len() {
            let ticker_vector = vectors.get(i);
            if ticker_vector.ticker_id() != ticker_id {
                if let Some(other_vector) = ticker_vector.vector() {
                    let distance = euclidean_distance(&target_vector, &other_vector);

                    // Extract non-translated PCA coordinates
                    let original_pca_coords = ticker_vector.pca_coordinates()
                        .map(|coords| coords.iter().map(|c| c as f64).collect::<Vec<f64>>())
                        .unwrap_or_default();

                    // Compute translated PCA coordinates
                    let translated_pca_coords = ticker_vector.pca_coordinates()
                        .map(|coords| {
                            coords.iter()
                                .zip(&target_pca_coords)
                                .map(|(c, &target_c)| c as f64 - target_c)
                                .collect::<Vec<f64>>()
                        })
                        .unwrap_or_default();

                    results.push((ticker_vector.ticker_id(), distance, original_pca_coords, translated_pca_coords));
                }
            }
        }
    }

    // Sort by Euclidean distance in ascending order and take the top 20
    results.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    let top_20 = results.iter().take(20).collect::<Vec<_>>();

    // Create JS array of objects with Ticker ID, distance, original and translated PCA coordinates
    let js_array = js_sys::Array::new();
    for &(id, distance, ref original_pca_coords, ref translated_pca_coords) in top_20 {
        let obj = js_sys::Object::new();
        js_sys::Reflect::set(&obj, &JsValue::from_str("ticker_id"), &JsValue::from(id)).unwrap();
        js_sys::Reflect::set(&obj, &JsValue::from_str("distance"), &JsValue::from(distance)).unwrap();

        // Convert original PCA coordinates to JS array
        let original_pca_array = js_sys::Array::new();
        for &coord in original_pca_coords {
            original_pca_array.push(&JsValue::from_f64(coord));
        }
        js_sys::Reflect::set(&obj, &JsValue::from_str("original_pca_coordinates"), &original_pca_array.into()).unwrap();

        // Convert translated PCA coordinates to JS array
        let translated_pca_array = js_sys::Array::new();
        for &coord in translated_pca_coords {
            translated_pca_array.push(&JsValue::from_f64(coord));
        }
        js_sys::Reflect::set(&obj, &JsValue::from_str("translated_pca_coordinates"), &translated_pca_array.into()).unwrap();

        js_array.push(&obj);
    }

    Ok(js_array.into())
}

// Helper function to compute Euclidean distance between two vectors
fn euclidean_distance(vector1: &flatbuffers::Vector<'_, f32>, vector2: &flatbuffers::Vector<'_, f32>) -> f64 {
    vector1.iter().zip(vector2.iter())
        .map(|(a, b)| (a as f64 - b as f64).powi(2))
        .sum::<f64>()
        .sqrt()
}
