use wasm_bindgen::prelude::*;
use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use flate2::read::GzDecoder;
use js_sys::Date;
use std::convert::TryInto;
use std::io::Read;
use hex;
use std::cell::RefCell;
use futures::FutureExt;

use crate::utils::{CACHE, CachedFuture};
use crate::utils::decrypt::password::{
    Aes256Cbc,
    get_encrypted_password,
    get_iv,
    decrypt_password
};
use crate::utils::xhr_fetch;

pub async fn fetch_and_decompress_gz<T>(url: T, use_cache: bool) -> Result<Vec<u8>, JsValue>
where
    T: AsRef<str> + Clone,
{
    let url_str: String = url.as_ref().to_string();

    if use_cache {
        let shared_future = CACHE.with(|cache| {
            let mut cache = cache.borrow_mut();
            if let Some(cached_future) = cache.get(&url_str) {
                *cached_future.last_accessed.borrow_mut() = Date::now();
                *cached_future.access_count.borrow_mut() += 1;
                cached_future.future.clone()
            } else {
                let future = decrypt_and_decompress_data(url_str.clone()).boxed_local().shared();
                let cached_future = CachedFuture {
                    future: future.clone(),
                    added_at: Date::now(),
                    last_accessed: RefCell::new(Date::now()),
                    access_count: RefCell::new(1),
                };
                cache.insert(url_str.clone(), cached_future);
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
    } else {
        web_sys::console::debug_1(&"Skipping cache".into());
        decrypt_and_decompress_data(url_str).await
    }
}

async fn decrypt_and_decompress_data(url: String) -> Result<Vec<u8>, JsValue> {
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

    let mut decoder = GzDecoder::new(&decrypted_data[..]);
    let mut decompressed_data = Vec::new();
    decoder.read_to_end(&mut decompressed_data).map_err(|err| {
        web_sys::console::debug_1(&format!("Failed to decompress data: {}", err).into());
        JsValue::from_str(&format!("Failed to decompress data: {}", err))
    })?;

    Ok(decompressed_data)
}
