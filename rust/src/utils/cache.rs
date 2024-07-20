use wasm_bindgen::prelude::*;
use js_sys::Date;
use serde::Serialize;
use std::collections::HashMap;
use std::cell::RefCell;
use futures::future::Shared;
use futures::FutureExt;
use futures::future::LocalBoxFuture;

// use crate::utils::Notifier;

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
    // Notifier::cache_accessed();
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

pub fn get_cache_future(url_str: &str) -> Option<Shared<LocalBoxFuture<'static, Result<Vec<u8>, JsValue>>>> {
    // Notifier::cache_accessed();
    CACHE.with(|cache| {
        let cache = cache.borrow_mut();
        if let Some(cached_future) = cache.get(url_str) {
            *cached_future.last_accessed.borrow_mut() = Date::now();
            *cached_future.access_count.borrow_mut() += 1;
            Some(cached_future.future.clone())
        } else {
            None
        }
    })
}

pub fn insert_cache_future(url_str: &str, future: Shared<LocalBoxFuture<'static, Result<Vec<u8>, JsValue>>>) {
    // Notifier::cache_inserted();
    CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        let cached_future = CachedFuture {
            future: future.clone(),
            added_at: Date::now(),
            last_accessed: RefCell::new(Date::now()),
            access_count: RefCell::new(1),
        };
        cache.insert(url_str.to_string(), cached_future);
    });
}

pub fn remove_cache_entry(key: &str) {
    // Notifier::cache_entry_removed(key);
    CACHE.with(|cache| {
        cache.borrow_mut().remove(key);
    });
}

pub fn clear_cache() {
    // Notifier::cache_cleared();
    CACHE.with(|cache| {
        cache.borrow_mut().clear();
    });
}
