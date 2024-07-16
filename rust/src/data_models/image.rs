use wasm_bindgen::prelude::*;
use crate::utils::fetch::fetch_and_decompress_gz;
use base64::{engine::general_purpose, Engine as _}; // Import the appropriate engine

pub struct Image {
    pub data: Vec<u8>,
}

impl Image {
    pub async fn get_image(url: &str) -> Result<Image, JsValue> {
        let image_data = fetch_and_decompress_gz(url.to_string()).await?;
        Ok(Image { data: image_data })
    }

    pub async fn get_image_base64(url: &str) -> Result<String, JsValue> {
        let image_data = fetch_and_decompress_gz(url.to_string()).await?;
        let base64_data = general_purpose::STANDARD.encode(&image_data); // Use the new encoding method
        Ok(base64_data)
    }
}
