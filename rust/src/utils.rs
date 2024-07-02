use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::XmlHttpRequest;
use flate2::read::GzDecoder;
use std::io::Read;
use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use hex_literal::hex;
use js_sys::Promise;
use std::convert::TryInto;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

pub async fn fetch_and_decompress_gz(url: &str, password: &str) -> Result<String, JsValue> {
    web_sys::console::log_1(&"Starting fetch_and_decompress_gz".into());
    let xhr = XmlHttpRequest::new().unwrap();
    xhr.open("GET", url).unwrap();
    xhr.set_response_type(web_sys::XmlHttpRequestResponseType::Arraybuffer);
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

    JsFuture::from(promise).await.map_err(|_| {
        web_sys::console::log_1(&"Failed to fetch data".into());
        JsValue::from_str("Failed to fetch data")
    })?;

    if xhr.status().unwrap() != 200 {
        let status_code = xhr.status().unwrap();
        web_sys::console::log_1(&format!("Failed to load data, status code: {}", status_code).into());
        return Err(JsValue::from_str(&format!("Failed to load data, status code: {}", status_code)));
    }

    web_sys::console::log_1(&"Data fetched successfully".into());
    let array_buffer = xhr.response().unwrap();
    let buffer = js_sys::Uint8Array::new(&array_buffer);
    let encrypted_data = buffer.to_vec();

    web_sys::console::log_1(&format!("Encrypted data length: {}", encrypted_data.len()).into());

    // Decrypt the encrypted data
    let key = hex!("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
    web_sys::console::log_1(&format!("Derived Key: {:?}", key).into())
    ;
    let iv = &encrypted_data[0..16];
    web_sys::console::log_1(&format!("IV: {:?}", iv).into());
    let cipher = Aes256Cbc::new_from_slices(&key, iv).map_err(|e| {
        web_sys::console::log_1(&format!("Failed to create cipher: {}", e).into());
        JsValue::from_str(&format!("Failed to create cipher: {}", e))
    })?;
    web_sys::console::log_1(&format!("Cipher created successfully").into());
    let decrypted_data = cipher.decrypt_vec(&encrypted_data[16..]).map_err(|e| {
        web_sys::console::log_1(&format!("Failed to decrypt data: {}", e).into());
        JsValue::from_str(&format!("Failed to decrypt data: {}", e))
    })?;

    web_sys::console::log_1(&format!("Decrypted data length: {}", decrypted_data.len()).into());

    // Decompress the JSON data
    let mut decoder = GzDecoder::new(&decrypted_data[..]);
    let mut json_data = String::new();
    decoder.read_to_string(&mut json_data).map_err(|err| {
        web_sys::console::log_1(&format!("Failed to decompress JSON: {}", err).into());
        JsValue::from_str(&format!("Failed to decompress JSON: {}", err))
    })?;

    web_sys::console::log_1(&"Data decompressed successfully".into());
    Ok(json_data)
}
