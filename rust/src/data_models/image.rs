// use wasm_bindgen::prelude::*;
use serde::Serialize;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use base64::{engine::general_purpose, Engine as _};
use wasm_bindgen::JsValue;
use image::{GenericImageView, Pixel, Rgba};
use std::collections::HashMap;
use web_sys::console;

#[derive(Serialize)]
pub struct ImageInfo {
    base64: String,
    rgba: String,
}

// impl ImageInfo {
//     pub fn base64(&self) -> String {
//         self.base64.clone()
//     }

//     pub fn rgba(&self) -> String {
//         self.rgba.clone()
//     }
// }

pub async fn get_image_base64(url: &str) -> Result<ImageInfo, JsValue> {
    // Fetch and decompress the image data
    let image_data = fetch_and_decompress_gz(url.to_string(), true).await?;
    
    // Load the image from the byte data
    let img = image::load_from_memory(&image_data).map_err(|e| JsValue::from_str(&format!("Failed to load image: {:?}", e)))?;
    
    // Get image dimensions
    let (width, height) = img.dimensions();
    let corners = vec![
        (0, 0),               // top-left
        (width - 1, 0),       // top-right
        (0, height - 1),      // bottom-left
        (width - 1, height - 1), // bottom-right
    ];

    let mut color_counts: HashMap<Rgba<u8>, u32> = HashMap::new();

    // Count the colors in the corners
    for &(x, y) in &corners {
        let pixel = img.get_pixel(x, y);
        let entry = color_counts.entry(pixel.to_rgba()).or_insert(0);
        *entry += 1;
    }

    // Determine the most common color
    let background_color = color_counts.into_iter().max_by_key(|&(_, count)| count).map(|(color, _)| color);

    let rgba_string = if let Some(background_color) = background_color {
        let (r, g, b, a) = (
            background_color[0],
            background_color[1],
            background_color[2],
            background_color[3],
        );

        format!("rgba({}, {}, {}, {})", r, g, b, a as f32 / 255.0)
    } else {
        "Could not determine background color".to_string()
    };

    console::log_1(&rgba_string.clone().into());

    // Encode the image data to base64
    let base64_data = general_purpose::STANDARD.encode(image_data);

    Ok(ImageInfo {
        base64: base64_data,
        rgba: rgba_string,
    })
}