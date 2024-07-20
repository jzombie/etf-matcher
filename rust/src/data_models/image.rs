use wasm_bindgen::prelude::*;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use base64::{engine::general_purpose, Engine as _}; // Import the appropriate engine

pub async fn get_image_base64(url: &str) -> Result<String, JsValue> {
    let image_data = fetch_and_decompress_gz(url.to_string(), true).await?;
    let base64_data = general_purpose::STANDARD.encode(&image_data);
    Ok(base64_data)
}
