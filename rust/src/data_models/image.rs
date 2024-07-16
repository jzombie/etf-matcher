use wasm_bindgen::prelude::*;
use crate::utils::fetch::fetch_and_decompress_gz;
use crate::data_models::DataURL;
use base64::encode;

pub struct Image {
    pub data: Vec<u8>,
}

impl Image {
    pub async fn get_image(url: &str) -> Result<Image, JsValue> {
        let image_data = fetch_and_decompress_gz(url.to_string()).await?;
        Ok(Image { data: image_data.into() })
    }

    pub async fn get_image_base64(url: &str) -> Result<String, JsValue> {
        let image_data = fetch_and_decompress_gz(url.to_string()).await?;
        let base64_data = encode(&image_data);
        Ok(base64_data)
    }
}
