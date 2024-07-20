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
use std::convert::TryInto;
use std::io::Read;
use hex;
use std::collections::HashMap;
use std::cell::RefCell;
use futures::future::Shared;
use futures::FutureExt;
use futures::future::LocalBoxFuture;

// Global cache with futures for pending requests
thread_local! {
  pub static CACHE: RefCell<HashMap<String, CachedFuture>> = RefCell::new(HashMap::new());
}

pub fn get_cache_size() -> usize {
  CACHE.with(|cache| {
      let cache = cache.borrow();
      cache.values().map(|cached_future| {
          cached_future.future.clone().now_or_never().map_or(0, |result| {
              result.map_or(0, |data| data.len())
          })
      }).sum()
  })
}

pub struct CachedFuture {
  pub future: Shared<LocalBoxFuture<'static, Result<Vec<u8>, JsValue>>>, // Adjusted to Vec<u8>
  pub added_at: f64,
  pub last_accessed: RefCell<f64>,
  pub access_count: RefCell<u32>,
}

#[derive(Serialize)]
pub struct CacheEntry {
  pub key: String,
  pub size: usize,
  pub age: f64,           // Age in milliseconds
  pub last_accessed: f64, // Last accessed time in milliseconds since UNIX_EPOCH
  pub access_count: u32,  // Number of times accessed
}

pub fn get_cache_details() -> JsValue {
  CACHE.with(|cache| {
      let cache = cache.borrow();
      let now = Date::now();
      let details: Vec<CacheEntry> = cache.iter()
          .map(|(key, cached_future)| {
              let size = cached_future.future.clone().now_or_never().map_or(0, |result| {
                  result.map_or(0, |data| data.len())
              });
              let age = now - cached_future.added_at;
              let last_accessed = now - *cached_future.last_accessed.borrow();
              let access_count = *cached_future.access_count.borrow();
              CacheEntry {
                  key: key.clone(),
                  size,
                  age,
                  last_accessed,
                  access_count,
              }
          })
          .collect();
      serde_wasm_bindgen::to_value(&details).unwrap()
  })
}

pub fn remove_cache_entry(key: &str) {
  CACHE.with(|cache| {
      cache.borrow_mut().remove(key);
  });
}

pub fn clear_cache() {
  CACHE.with(|cache| {
      cache.borrow_mut().clear();
  });
}