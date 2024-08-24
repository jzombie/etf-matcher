extern crate flatbuffers as fb;
use data_models::ticker_vector_analysis::TickerWithQuantity;
use qrcode_generator::QrCodeEcc;
use serde_wasm_bindgen::to_value;
use std::panic;
use wasm_bindgen::prelude::*;

mod constants;
mod data_models;
mod types;
mod utils;

use crate::types::TickerId;

use crate::data_models::{
    ticker_vector_analysis, DataBuildInfo, DataURL, ETFAggregateDetail, ETFAggregateDetailResponse,
    ETFHoldingTicker, ETFHoldingTickerResponse, ETFHoldingWeightResponse, ExchangeById,
    IndustryById, PaginatedResults, SectorById, Ticker10KDetail, TickerDetail,
    TickerDetailResponse, TickerETFHolder, TickerSearch, TickerSearchResult,
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
pub async fn find_closest_tickers(ticker_id: TickerId) -> Result<JsValue, JsValue> {
    // Call the find_closest_tickers function from the ticker_vector_analysis module
    let closest_tickers = ticker_vector_analysis::find_closest_tickers(ticker_id)
        .await
        .map_err(|err| JsValue::from_str(&format!("Failed to find closest ticker IDs: {}", err)))?;

    // Convert the results to JsValue
    let js_array = js_sys::Array::new();

    for ticker_distance in closest_tickers {
        let obj = js_sys::Object::new();
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("ticker_id"),
            &JsValue::from(ticker_distance.ticker_id),
        )
        .unwrap();
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("distance"),
            &JsValue::from(ticker_distance.distance),
        )
        .unwrap();

        // Convert original PCA coordinates to JS array
        let original_pca_array = js_sys::Array::new();
        for coord in ticker_distance.original_pca_coords {
            original_pca_array.push(&JsValue::from_f64(coord as f64));
        }
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("original_pca_coords"),
            &original_pca_array.into(),
        )
        .unwrap();

        // Convert translated PCA coordinates to JS array
        let translated_pca_array = js_sys::Array::new();
        for coord in ticker_distance.translated_pca_coords {
            translated_pca_array.push(&JsValue::from_f64(coord as f64));
        }
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("translated_pca_coords"),
            &translated_pca_array.into(),
        )
        .unwrap();

        js_array.push(&obj);
    }

    Ok(js_array.into())
}

#[wasm_bindgen]
pub async fn rank_tickers_by_cosine_similarity(ticker_id: TickerId) -> Result<JsValue, JsValue> {
    // Call the rank_tickers_by_cosine_similarity function from the ticker_vector_analysis module
    let similar_tickers = ticker_vector_analysis::rank_tickers_by_cosine_similarity(ticker_id)
        .await
        .map_err(|err| {
            JsValue::from_str(&format!(
                "Failed to rank tickers by cosine similarity: {}",
                err
            ))
        })?;

    // Convert the results to JsValue
    let js_array = js_sys::Array::new();

    for similarity_result in similar_tickers {
        let obj = js_sys::Object::new();
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("ticker_id"),
            &JsValue::from(similarity_result.ticker_id),
        )
        .unwrap();
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("similarity_score"),
            &JsValue::from(similarity_result.similarity_score),
        )
        .unwrap();

        // Convert original PCA coordinates to JS array, if present
        if let Some(original_pca_coords) = similarity_result.original_pca_coords {
            let original_pca_array = js_sys::Array::new();
            for coord in original_pca_coords {
                original_pca_array.push(&JsValue::from_f64(coord as f64));
            }
            js_sys::Reflect::set(
                &obj,
                &JsValue::from_str("original_pca_coords"),
                &original_pca_array.into(),
            )
            .unwrap();
        }

        // Convert translated PCA coordinates to JS array, if present
        if let Some(translated_pca_coords) = similarity_result.translated_pca_coords {
            let translated_pca_array = js_sys::Array::new();
            for coord in translated_pca_coords {
                translated_pca_array.push(&JsValue::from_f64(coord as f64));
            }
            js_sys::Reflect::set(
                &obj,
                &JsValue::from_str("translated_pca_coords"),
                &translated_pca_array.into(),
            )
            .unwrap();
        }

        js_array.push(&obj);
    }

    Ok(js_array.into())
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

// TODO: Refactor as needed
#[wasm_bindgen]
pub async fn proto_analyze_tickers_with_quantity(
    tickers_with_quantity: JsValue,
) -> Result<JsValue, JsValue> {
    // Deserialize the input JsValue into Rust Vec<TickerWithQuantity>
    let tickers_with_quantity: Vec<TickerWithQuantity> =
        serde_wasm_bindgen::from_value(tickers_with_quantity)
            .map_err(|err| JsValue::from_str(&format!("Failed to deserialize input: {}", err)))?;

    // Call the Rust function to analyze the tickers
    ticker_vector_analysis::proto_analyze_tickers_with_quantity(tickers_with_quantity).await;

    // Return success response
    Ok(JsValue::from_bool(true))
}
