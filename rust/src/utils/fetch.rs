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
use js_sys::{Promise, Date, Uint8Array};
use serde::Serialize;
use serde_wasm_bindgen::to_value;
use std::convert::TryInto;
use std::io::Read;
use hex;
use std::collections::HashMap;
use std::cell::RefCell;
use futures::future::Shared;
use futures::{Future, FutureExt};
use futures::future::LocalBoxFuture;

use crate::constants::{
  FETCH_ERROR,
  XML_HTTP_REQUEST_CREATE_ERROR,
  XML_HTTP_REQUEST_OPEN_ERROR,
  XML_HTTP_REQUEST_CACHE_CONTROL_SETTER_ERROR,
  XML_HTTP_REQUEST_SEND_ERROR
};

include!("../__AUTOGEN__generated_password.rs");

pub fn decrypt_password(encrypted_password: &[u8], salt: &[u8]) -> Result<[u8; 32], JsValue> {
    // Derive the decryption key
    let mut key = [0u8; 32];
    pbkdf2::<Hmac<Sha256>>(encrypted_password, salt, 10000, &mut key);
    Ok(key)
}

pub fn get_cache_size() -> usize {
    CACHE.with(|cache| {
        let cache = cache.borrow();
        cache.len()
    })
}

#[derive(Serialize)]
struct CacheEntry {
    key: String,
    status: String,
}

pub fn get_cache_details() -> JsValue {
    CACHE.with(|cache| {
        let cache = cache.borrow();
        let details: Vec<CacheEntry> = cache.iter()
            .map(|(key, _)| CacheEntry {
                key: key.clone(),
                status: "cached".to_string(),
            })
            .collect();
        serde_wasm_bindgen::to_value(&details).unwrap()
    })
}

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

// Global cache with futures for pending requests
thread_local! {
    static CACHE: RefCell<HashMap<String, Shared<LocalBoxFuture<'static, Result<String, JsValue>>>>> = RefCell::new(HashMap::new());
}

// TODO: Compress xhr_fetch directly to save additional memory?
pub async fn fetch_and_decompress_gz<T>(url: T) -> Result<String, JsValue>
where
    T: AsRef<str> + Clone,
{
    let url_str: String = url.as_ref().to_string();

    let shared_future: Shared<std::pin::Pin<Box<dyn Future<Output = Result<String, JsValue>>>>> = CACHE.with(|cache| {
        let mut cache: std::cell::RefMut<HashMap<String, Shared<std::pin::Pin<Box<dyn Future<Output = Result<String, JsValue>>>>>>> = cache.borrow_mut();
        if let Some(cached_future) = cache.get(&url_str) {
            cached_future.clone()
        } else {
            let future = fetch_and_decompress_gz_internal(url_str.clone()).boxed_local().shared();
            cache.insert(url_str.clone(), future.clone());
            future
        }
    });

    match shared_future.await {
        Ok(result) => Ok(result),
        Err(err) => {
            CACHE.with(|cache| {
                cache.borrow_mut().remove(&url_str);
            });
            Err(JsValue::from_str(&format!("Error: {:?}", err)))
        },
    }
}

pub async fn fetch_and_decompress_gz_non_cached<T>(url: T) -> Result<String, JsValue>
where
    T: AsRef<str> + Clone,
{
    web_sys::console::debug_1(&"Skipping cache".into());
    let url_str: String = url.as_ref().to_string();
    fetch_and_decompress_gz_internal(url_str.clone()).await
}

async fn xhr_fetch(url: String) -> Result<Vec<u8>, JsValue> {
    let xhr: XmlHttpRequest = XmlHttpRequest::new().map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_CREATE_ERROR}: {:?}", err).into());
        JsValue::from_str(XML_HTTP_REQUEST_CREATE_ERROR)
    })?;

    let timestamp: String = Date::now().to_string();
    let no_cache_url: String = format!("{}?no_cache={}", url, timestamp);

    xhr.open("GET", &no_cache_url).map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_OPEN_ERROR}: {:?}", err).into());
        JsValue::from_str(XML_HTTP_REQUEST_OPEN_ERROR)
    })?;

    xhr.set_response_type(web_sys::XmlHttpRequestResponseType::Arraybuffer);

    xhr.set_request_header("Cache-Control", "no-cache").map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_CACHE_CONTROL_SETTER_ERROR}: {:?}", err).into());
        JsValue::from_str(XML_HTTP_REQUEST_CACHE_CONTROL_SETTER_ERROR)
    })?;

    xhr.send().map_err(|err: JsValue| {
        web_sys::console::debug_1(&format!("{XML_HTTP_REQUEST_SEND_ERROR}: {:?}", err).into());
        JsValue::from_str(XML_HTTP_REQUEST_SEND_ERROR)
    })?;

    let promise: Promise = Promise::new(&mut |resolve, reject: js_sys::Function| {
        let onload: Closure<dyn FnMut()> = Closure::wrap(Box::new(move || {
            resolve.call1(&JsValue::NULL, &JsValue::NULL).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onload(Some(onload.as_ref().unchecked_ref()));
        onload.forget();

        let onerror: Closure<dyn FnMut()> = Closure::wrap(Box::new(move || {
            reject.call1(&JsValue::NULL, &JsValue::from_str(FETCH_ERROR)).unwrap();
        }) as Box<dyn FnMut()>);
        xhr.set_onerror(Some(onerror.as_ref().unchecked_ref()));
        onerror.forget();
    });

    JsFuture::from(promise).await.map_err(|_| {
        web_sys::console::debug_1(&FETCH_ERROR.into());
        JsValue::from_str(FETCH_ERROR)
    })?;

    if xhr.status().unwrap() != 200 {
        let status_code: u16 = xhr.status().unwrap();
        web_sys::console::debug_1(&format!("Failed to load data, status code: {}", status_code).into());
        return Err(JsValue::from_str(&format!("Failed to load data, status code: {}", status_code)));
    }

    let array_buffer: JsValue = xhr.response().unwrap();

    let buffer: Uint8Array = Uint8Array::new(&array_buffer);

    Ok(buffer.to_vec())
}

async fn fetch_and_decompress_gz_internal(url: String) -> Result<String, JsValue> {
    let encrypted_data: Vec<u8> = xhr_fetch(url).await?;

    let salt: &[u8] = &encrypted_data[0..16];

    let encrypted_password: Vec<u8> = hex::decode(get_encrypted_password().as_bytes()).unwrap();
    let key: [u8; 32] = decrypt_password(&encrypted_password, salt)?;

    let iv: [u8; 16] = hex::decode(get_iv().as_bytes()).unwrap().try_into().unwrap();

    let cipher: Cbc<Aes256, Pkcs7> = Aes256Cbc::new_from_slices(&key, &iv).map_err(|e| {
        web_sys::console::debug_1(&format!("Failed to create cipher: {}", e).into());
        JsValue::from_str(&format!("Failed to create cipher: {}", e))
    })?;

    let decrypted_data: Vec<u8> = cipher.decrypt_vec(&encrypted_data[32..]).map_err(|e| {
        web_sys::console::debug_1(&format!("Failed to decrypt data: {}", e).into());
        JsValue::from_str(&format!("Failed to decrypt data: {}", e))
    })?;

    let mut decoder: GzDecoder<&[u8]> = GzDecoder::new(&decrypted_data[..]);
    let mut csv_data: String = String::new();
    decoder.read_to_string(&mut csv_data).map_err(|err| {
        web_sys::console::debug_1(&format!("Failed to decompress CSV: {}", err).into());
        JsValue::from_str(&format!("Failed to decompress CSV: {}", err))
    })?;

    Ok(csv_data)
}
