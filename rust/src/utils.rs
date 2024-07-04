use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use flate2::read::GzDecoder;
use hmac::Hmac;
use pbkdf2::pbkdf2;
use sha2::Sha256;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::XmlHttpRequest;
use js_sys::Promise;
use std::convert::TryInto;
use std::io::Read;
use hex;
use std::collections::HashMap;
use std::cell::RefCell;
use futures::future::Shared;
use futures::FutureExt;
use futures::future::LocalBoxFuture;

include!("__AUTOGEN__generated_password.rs");

// Global cache with futures for pending requests
thread_local! {
    static CACHE: RefCell<HashMap<String, Shared<LocalBoxFuture<'static, Result<String, JsValue>>>>> = RefCell::new(HashMap::new());
}

// TODO: Implement once ready
// pub fn clear_cache() {
//     CACHE.with(|cache| {
//         cache.borrow_mut().clear();
//     });
// }

fn decrypt_password(encrypted_password: &[u8], salt: &[u8]) -> Result<[u8; 32], JsValue> {
    // Derive the decryption key
    let mut key = [0u8; 32];
    pbkdf2::<Hmac<Sha256>>(encrypted_password, salt, 10000, &mut key);

    // TODO: Only log during debugging
    // web_sys::console::debug_1(&format!("Derived Key: {:?}", key).into());

    Ok(key)
}

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

pub async fn fetch_and_decompress_gz<T>(url: T) -> Result<String, JsValue>
where
    T: AsRef<str> + Clone,
{
    let url_str = url.as_ref().to_string();
    let _url_key = url.clone();

    let shared_future = CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if let Some(cached_future) = cache.get(&url_str) {
            // web_sys::console::debug_1(&"Returning cached future".into());
            cached_future.clone()
        } else {
            // web_sys::console::debug_1(&"Storing new future in cache".into());
            let future = fetch_and_decompress_gz_internal(url_str.clone()).boxed_local().shared();
            cache.insert(url_str, future.clone());
            future
        }
    });

    match shared_future.await {
        Ok(result) => Ok(result),
        Err(err) => Err(JsValue::from_str(&format!("Error: {:?}", err))),
    }
}

pub async fn fetch_and_decompress_gz_non_cached<T>(url: T) -> Result<String, JsValue>
where
    T: AsRef<str> + Clone,
{
    web_sys::console::debug_1(&"Skipping cache".into());
    let url_str = url.as_ref().to_string();
    fetch_and_decompress_gz_internal(url_str.clone()).await
}

async fn fetch_and_decompress_gz_internal(url: String) -> Result<String, JsValue> {
    // web_sys::console::debug_1(&"Starting fetch_and_decompress_gz".into());
    let xhr = XmlHttpRequest::new().map_err(|err| {
        web_sys::console::debug_1(&format!("Failed to create XMLHttpRequest: {:?}", err).into());
        JsValue::from_str("Failed to create XMLHttpRequest")
    })?;
    xhr.open("GET", &url).map_err(|err| {
        web_sys::console::debug_1(&format!("Failed to open XMLHttpRequest: {:?}", err).into());
        JsValue::from_str("Failed to open XMLHttpRequest")
    })?;
    xhr.set_response_type(web_sys::XmlHttpRequestResponseType::Arraybuffer);
    xhr.send().map_err(|err| {
        web_sys::console::debug_1(&format!("Failed to send XMLHttpRequest: {:?}", err).into());
        JsValue::from_str("Failed to send XMLHttpRequest")
    })?;

    let promise = Promise::new(&mut |resolve, reject| {
        let onload = Closure::wrap(Box::new(move || {
            resolve.call1(&JsValue::NULL, &JsValue::NULL).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onload(Some(onload.as_ref().unchecked_ref()));
        onload.forget();

        let onerror = Closure::wrap(Box::new(move || {
            reject.call1(&JsValue::NULL, &JsValue::from_str("Failed to fetch data")).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onerror(Some(onerror.as_ref().unchecked_ref()));
        onerror.forget();
    });

    JsFuture::from(promise).await.map_err(|_| {
        web_sys::console::debug_1(&"Failed to fetch data".into());
        JsValue::from_str("Failed to fetch data")
    })?;

    if xhr.status().unwrap() != 200 {
        let status_code = xhr.status().unwrap();
        web_sys::console::debug_1(&format!("Failed to load data, status code: {}", status_code).into());
        return Err(JsValue::from_str(&format!("Failed to load data, status code: {}", status_code)));
    }

    // web_sys::console::debug_1(&"Data fetched successfully".into());
    let array_buffer = xhr.response().unwrap();
    let buffer = js_sys::Uint8Array::new(&array_buffer);
    let encrypted_data = buffer.to_vec();

    // TODO: Only allow during debugging
    // web_sys::console::debug_1(&format!("Encrypted data length: {}", encrypted_data.len()).into());

    // Ensure the correct salt extraction method
    // Assuming the salt was stored in the first 16 bytes of the encrypted data
    let salt = &encrypted_data[0..16];

    // TODO: Only allow during debugging
    // web_sys::console::debug_1(&format!("Salt: {:?}", salt).into());

    // Decrypt the password
    let encrypted_password: Vec<u8> = hex::decode(ENCRYPTED_PASSWORD).unwrap();
    let key = decrypt_password(&encrypted_password, salt)?;

    // Assuming the IV was stored in the next 16 bytes of the encrypted data
    let iv: [u8; 16] = hex::decode(IV).unwrap().try_into().unwrap();

    // TODO: Only allow during debugging
    // web_sys::console::debug_1(&format!("IV: {:?}", iv).into());

    let cipher = Aes256Cbc::new_from_slices(&key, &iv).map_err(|e| {
        web_sys::console::debug_1(&format!("Failed to create cipher: {}", e).into());
        JsValue::from_str(&format!("Failed to create cipher: {}", e))
    })?;

    // web_sys::console::debug_1(&"Cipher created successfully".into());
    let decrypted_data = cipher.decrypt_vec(&encrypted_data[32..]).map_err(|e| {
        web_sys::console::debug_1(&format!("Failed to decrypt data: {}", e).into());
        JsValue::from_str(&format!("Failed to decrypt data: {}", e))
    })?;

    // web_sys::console::debug_1(&format!("Decrypted data length: {}", decrypted_data.len()).into());

    // Decompress the JSON data
    let mut decoder = GzDecoder::new(&decrypted_data[..]);
    let mut json_data = String::new();
    decoder.read_to_string(&mut json_data).map_err(|err| {
        web_sys::console::debug_1(&format!("Failed to decompress JSON: {}", err).into());
        JsValue::from_str(&format!("Failed to decompress JSON: {}", err))
    })?;

    // web_sys::console::debug_1(&"Data decompressed successfully".into());
    Ok(json_data)
}
