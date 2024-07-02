use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::XmlHttpRequest;
use flate2::read::GzDecoder;
use std::io::Read;
use js_sys::Promise;

pub async fn fetch_and_decompress_gz(url: &str) -> Result<String, JsValue> {
    let xhr = XmlHttpRequest::new().unwrap();
    xhr.open("GET", url).unwrap();
    xhr.set_response_type(web_sys::XmlHttpRequestResponseType::Arraybuffer); // Correctly setting the response type
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
    decoder.read_to_string(&mut json_data).map_err(|err| {
        JsValue::from_str(&format!("Failed to decompress JSON: {}", err))
    })?;

    Ok(json_data)
}
