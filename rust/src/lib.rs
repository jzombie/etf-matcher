extern crate flatbuffers as fb;
use data_models::ticker_vector_analysis::TickerWithWeight;
use levenshtein::levenshtein;
use qrcode_generator::QrCodeEcc;
use serde_wasm_bindgen::{from_value, to_value};
use std::panic;
use wasm_bindgen::prelude::*;

pub mod config;
mod constants;
mod data_models;
mod types;
mod utils;

use crate::types::TickerSymbol;

use crate::data_models::{
    ticker_vector_analysis, DataBuildInfo, DataURL, ETFAggregateDetail, ETFHoldingTicker,
    ETFHoldingWeight, ExchangeById, IndustryById, PaginatedResults, SectorById, Ticker10KDetail,
    TickerBucket, TickerDetail, TickerETFHolder, TickerSearch, TickerSearchResult,
};

use crate::data_models::image::get_image_info as lib_get_image_info;

// Rename the imported functions to avoid name conflicts
use crate::utils::network_cache::{
    clear_cache as lib_clear_cache, get_cache_details as lib_get_cache_details,
    get_cache_size as lib_get_cache_size, remove_cache_entry as lib_remove_cache_entry,
};

use crate::utils::ticker_vector_config_utils;

include!("__AUTOGEN__compilation_time.rs");

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    web_sys::console::debug_1(&"Hello from Rust!".into());
    web_sys::console::debug_1(&format!("Rust compiled at: {}", RUST_COMPILATION_TIME).into());
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
    // Create a TickerSearch instance
    let ticker_search = TickerSearch {
        query: query.to_string(),
        page,
        page_size,
        only_exact_matches,
    };

    // Call the search_tickers method on the TickerSearch instance
    let results: PaginatedResults<TickerSearchResult> = ticker_search.search_tickers().await?;

    to_value(&results)
        .map_err(|err| JsValue::from_str(&format!("Failed to serialize results: {}", err)))
}

#[wasm_bindgen]
pub async fn extract_search_results_from_text(
    text: &str,
    page: usize,
    page_size: usize,
) -> Result<JsValue, JsValue> {
    // Extract and paginate search results from the input text
    let results = TickerSearch::extract_results_from_text(text, page, page_size).await?;

    // Serialize the paginated results for JavaScript interoperability
    to_value(&results)
        .map_err(|err| JsValue::from_str(&format!("Failed to serialize results: {}", err)))
}

#[wasm_bindgen]
pub async fn get_ticker_detail(ticker_symbol: TickerSymbol) -> Result<JsValue, JsValue> {
    let ticker_detail: TickerDetail = TickerDetail::get_ticker_detail(ticker_symbol).await?;
    to_value(&ticker_detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert TickerDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_weighted_ticker_sector_distribution(
    ticker_weights_js: JsValue,
) -> Result<JsValue, JsValue> {
    let ticker_weights: Vec<(TickerSymbol, f64)> =
        from_value(ticker_weights_js).map_err(|err| {
            JsValue::from_str(&format!("Failed to deserialize ticker weights: {}", err))
        })?;

    // Call the Rust method to calculate weighted sector distribution
    let sector_distribution =
        TickerDetail::get_weighted_ticker_sector_distribution(ticker_weights).await?;

    // Serialize the result into JsValue
    to_value(&sector_distribution).map_err(|err| {
        JsValue::from_str(&format!("Failed to serialize sector distribution: {}", err))
    })
}

#[wasm_bindgen]
pub async fn get_ticker_10k_detail(ticker_symbol: TickerSymbol) -> Result<JsValue, JsValue> {
    let detail: Ticker10KDetail = Ticker10KDetail::get_ticker_10k_detail(ticker_symbol).await?;
    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert Ticker10KDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_weighted_ticker_10k_detail(
    ticker_weights_js: JsValue,
) -> Result<JsValue, JsValue> {
    let ticker_weights: Vec<(TickerSymbol, f64)> =
        from_value(ticker_weights_js).map_err(|err| {
            JsValue::from_str(&format!("Failed to deserialize ticker weights: {}", err))
        })?;

    let detail: Ticker10KDetail =
        Ticker10KDetail::get_weighted_ticker_10k_detail(ticker_weights).await?;

    to_value(&detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert Ticker10KDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_holders_aggregate_detail(
    ticker_symbol: TickerSymbol,
    page: usize,
    page_size: usize,
) -> Result<JsValue, JsValue> {
    let paginated_etf_aggregate_details: PaginatedResults<ETFAggregateDetail> =
        TickerETFHolder::get_etf_holders_aggregate_detail(ticker_symbol, page, page_size).await?;
    to_value(&paginated_etf_aggregate_details).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert PaginatedResults<ETFAggregateDetail> to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_aggregate_detail(ticker_symbol: TickerSymbol) -> Result<JsValue, JsValue> {
    let etf_detail: ETFAggregateDetail =
        ETFAggregateDetail::get_etf_aggregate_detail(ticker_symbol).await?;
    to_value(&etf_detail).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert ETFAggregateDetail to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_holdings(
    etf_ticker_symbol: TickerSymbol,
    page: usize,
    page_size: usize,
) -> Result<JsValue, JsValue> {
    let etf_holding_tickers: PaginatedResults<ETFHoldingTicker> =
        ETFHoldingTicker::get_etf_holdings(etf_ticker_symbol, page, page_size).await?;
    to_value(&etf_holding_tickers).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert <PaginatedResults<ETFHoldingTicker> to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_etf_holding_weight(
    etf_ticker_symbol: TickerSymbol,
    holding_ticker_symbol: TickerSymbol,
) -> Result<JsValue, JsValue> {
    let etf_holding_weight: ETFHoldingWeight =
        ETFHoldingTicker::get_etf_holding_weight(etf_ticker_symbol, holding_ticker_symbol).await?;
    to_value(&etf_holding_weight).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!(
            "Failed to convert ETFHoldingWeight to JsValue: {}",
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
pub async fn get_all_major_sectors() -> Result<JsValue, JsValue> {
    // Fetch all sectors by using the get_all_sectors method from the SectorById struct
    let all_sectors = SectorById::get_all_major_sectors().await?;

    // Convert the HashMap<SectorId, String> to a JsValue
    to_value(&all_sectors).map_err(|err: serde_wasm_bindgen::Error| {
        JsValue::from_str(&format!("Failed to convert sectors to JsValue: {}", err))
    })
}

#[wasm_bindgen]
pub async fn audit_missing_ticker_vectors(
    ticker_vector_config_key: &str,
    ticker_symbols_js: JsValue,
) -> Result<JsValue, JsValue> {
    // Deserialize the input `JsValue` into a vector of TickerId
    let ticker_symbols: Vec<TickerSymbol> = from_value(ticker_symbols_js).map_err(|err| {
        JsValue::from_str(&format!(
            "Failed to deserialize ticker IDs from input: {}",
            err
        ))
    })?;

    // Perform the audit to find missing tickers
    let missing_tickers = ticker_vector_analysis::OwnedTickerVectors::audit_missing_tickers(
        ticker_vector_config_key,
        &ticker_symbols,
    )
    .await
    .map_err(|err| JsValue::from_str(&format!("Failed to audit missing tickers: {}", err)))?;

    // Serialize the missing tickers to `JsValue`
    to_value(&missing_tickers).map_err(|err| {
        JsValue::from_str(&format!(
            "Failed to serialize missing tickers to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn get_euclidean_by_ticker(
    ticker_vector_config_key: &str,
    ticker_symbol: TickerSymbol,
) -> Result<JsValue, JsValue> {
    // Call the find_closest_tickers function from the ticker_vector_analysis module
    let closest_tickers = ticker_vector_analysis::TickerDistance::get_euclidean_by_ticker(
        ticker_vector_config_key,
        ticker_symbol,
    )
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
        let obj = js_sys::Object::new();
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("ticker_symbol"),
            &JsValue::from(ticker_distance.ticker_symbol),
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
pub async fn get_euclidean_by_ticker_bucket(
    ticker_vector_config_key: &str,
    tickers_with_quantity: JsValue,
) -> Result<JsValue, JsValue> {
    // Deserialize the input JsValue into Rust Vec<TickerWithWeight>
    let tickers_with_quantity: Vec<TickerWithWeight> =
        serde_wasm_bindgen::from_value(tickers_with_quantity)
            .map_err(|err| JsValue::from_str(&format!("Failed to deserialize input: {}", err)))?;

    // Find the closest tickers by quantity
    let closest_tickers: Vec<ticker_vector_analysis::TickerDistance> =
        ticker_vector_analysis::TickerDistance::get_euclidean_by_ticker_bucket(
            ticker_vector_config_key,
            &tickers_with_quantity,
        )
        .await
        .map_err(|err| JsValue::from_str(&err))?;

    // Serialize the result back to JsValue
    serde_wasm_bindgen::to_value(&closest_tickers)
        .map_err(|err| JsValue::from_str(&format!("Failed to serialize output: {}", err)))
}

#[wasm_bindgen]
pub async fn get_cosine_by_ticker(
    ticker_vector_config_key: &str,
    ticker_symbol: TickerSymbol,
) -> Result<JsValue, JsValue> {
    // Call the rank_tickers_by_cosine_similarity function from the ticker_vector_analysis module
    let similar_tickers = ticker_vector_analysis::CosineSimilarityResult::get_cosine_by_ticker(
        ticker_vector_config_key,
        ticker_symbol,
    )
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
            &JsValue::from_str("ticker_symbol"),
            &JsValue::from(similarity_result.ticker_symbol),
        )
        .unwrap();
        js_sys::Reflect::set(
            &obj,
            &JsValue::from_str("similarity_score"),
            &JsValue::from(similarity_result.similarity_score),
        )
        .unwrap();

        js_array.push(&obj);
    }

    Ok(js_array.into())
}

#[wasm_bindgen]
pub async fn get_cosine_by_ticker_bucket(
    ticker_vector_config_key: &str,
    tickers_with_quantity: JsValue,
) -> Result<JsValue, JsValue> {
    // Deserialize the input JsValue into Rust Vec<TickerWithWeight>
    let tickers_with_quantity: Vec<TickerWithWeight> =
        serde_wasm_bindgen::from_value(tickers_with_quantity)
            .map_err(|err| JsValue::from_str(&format!("Failed to deserialize input: {}", err)))?;

    // Rank tickers by cosine similarity using the quantity
    let ranked_tickers: Vec<ticker_vector_analysis::CosineSimilarityResult> =
        ticker_vector_analysis::CosineSimilarityResult::get_cosine_by_ticker_bucket(
            ticker_vector_config_key,
            &tickers_with_quantity,
        )
        .await
        .map_err(|err| JsValue::from_str(&err))?;

    // Serialize the result back to JsValue
    serde_wasm_bindgen::to_value(&ranked_tickers)
        .map_err(|err| JsValue::from_str(&format!("Failed to serialize output: {}", err)))
}

#[wasm_bindgen]
pub fn get_all_ticker_vector_configs() -> Result<JsValue, JsValue> {
    let configs = ticker_vector_config_utils::get_all_ticker_vector_configs();
    to_value(&configs).map_err(|err| {
        JsValue::from_str(&format!(
            "Failed to convert ticker vector configs to JsValue: {}",
            err
        ))
    })
}

#[wasm_bindgen]
pub async fn ticker_buckets_to_csv(json_ticker_buckets: JsValue) -> Result<JsValue, JsValue> {
    // Convert JsValue (JSON string) to a Rust String
    let json_string = json_ticker_buckets
        .as_string()
        .ok_or_else(|| JsValue::from_str("Failed to convert JsValue to string"))?;

    // Deserialize the JSON string into a vector of TickerBucket structs
    let ticker_buckets: Vec<TickerBucket> = serde_json::from_str(&json_string)
        .map_err(|err| JsValue::from_str(&format!("Deserialization error: {}", err)))?;

    // Convert the deserialized data to CSV
    let csv_data = TickerBucket::ticker_buckets_to_csv(ticker_buckets);

    // Return the CSV string
    Ok(JsValue::from_str(&csv_data))
}

#[wasm_bindgen]
pub async fn csv_to_ticker_buckets(csv_data: &str) -> Result<JsValue, JsValue> {
    // Call the existing Rust function that parses CSV into TickerBucket
    match TickerBucket::csv_to_ticker_buckets(csv_data).await {
        Ok(ticker_buckets) => {
            // Serialize the TickerBucket data into JsValue for use in JavaScript
            to_value(&ticker_buckets).map_err(|err| JsValue::from_str(&err.to_string()))
        }
        Err(err) => Err(err),
    }
}

#[wasm_bindgen]
pub fn levenshtein_distance(a: &str, b: &str) -> usize {
    levenshtein(a, b)
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
