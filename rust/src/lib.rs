use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{XmlHttpRequest, XmlHttpRequestResponseType};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use std::collections::HashMap;
use flate2::read::GzDecoder;
use std::io::Read;
use js_sys::Promise;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

// Option<type> allows null values
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Entry {
    symbol: Option<String>,
    name: Option<String>,
    price: Option<f64>,
    exchange: Option<String>,
    #[serde(rename = "exchangeShortName")]
    exchange_short_name: Option<String>,
    #[serde(rename = "type")]
    entry_type: Option<String>,
}

#[wasm_bindgen]
pub async fn count_entries_per_exchange(url: String) -> Result<JsValue, JsValue> {
    // Fetch the compressed JSON data
    let xhr = XmlHttpRequest::new().unwrap();
    xhr.open("GET", &url).unwrap();
    xhr.set_response_type(XmlHttpRequestResponseType::Arraybuffer); // Correctly setting the response type
    xhr.send().unwrap();

    let promise = Promise::new(&mut |resolve, reject| {
        let onload = Closure::wrap(Box::new(move || {
            resolve.call1(&JsValue::NULL, &JsValue::NULL).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onload(Some(onload.as_ref().unchecked_ref()));
        onload.forget();

        let onerror = Closure::wrap(Box::new(move || {
            reject.call1(&JsValue::NULL, &JsValue::NULL).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onerror(Some(onerror.as_ref().unchecked_ref()));
        onerror.forget();
    });

    JsFuture::from(promise).await.map_err(|_| JsValue::from_str("Failed to fetch data"))?;

    if xhr.status().unwrap() != 200 {
        return Err(JsValue::from_str("Failed to load data"));
    }

    let array_buffer = xhr.response().unwrap();
    let buffer = js_sys::Uint8Array::new(&array_buffer);
    let compressed_data = buffer.to_vec();

    // Decompress the JSON data
    let mut decoder = GzDecoder::new(&compressed_data[..]);
    let mut json_data = String::new();
    if let Err(err) = decoder.read_to_string(&mut json_data) {
        return Err(JsValue::from_str(&format!("Failed to decompress JSON: {}", err)));
    }

    // Parse the JSON data
    let entries: Vec<Entry> = match serde_json::from_str(&json_data) {
        Ok(entries) => entries,
        Err(err) => {
            return Err(JsValue::from_str(&format!("Failed to parse JSON: {}", err)));
        }
    };

    // Count the number of entries per exchange
    let mut counts: HashMap<String, usize> = HashMap::new();
    for entry in entries {
        if let Some(exchange) = &entry.exchange {
            *counts.entry(exchange.clone()).or_insert(0) += 1;
        }
    }

    // Convert the counts to a JSON value
    match to_value(&counts) {
        Ok(js_value) => Ok(js_value),
        Err(err) => Err(JsValue::from_str(&format!("Failed to serialize JSON: {}", err))),
    }
}
