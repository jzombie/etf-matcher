use futures::future::LocalBoxFuture;
use futures::future::Shared;
use futures::FutureExt;
use js_sys::Date;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

use super::notifier::Notifier;

// Global cache with futures for pending requests
thread_local! {
    pub static CACHE: RefCell<HashMap<String, CachedFuture>> = RefCell::new(HashMap::new());
}

pub fn get_cache_size() -> usize {
    let size = CACHE.with(|cache| {
        let cache = cache.borrow();
        cache
            .values()
            .map(|cached_future| {
                cached_future
                    .future
                    .clone()
                    .now_or_never()
                    .map_or(0, |result| result.map_or(0, |data| data.len()))
            })
            .sum()
    });

    Notifier::cache_accessed(Notifier::WILDCARD);

    size
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
    let details = CACHE.with(|cache| {
        let cache = cache.borrow();
        let now = Date::now();
        let details: Vec<CacheEntry> = cache
            .iter()
            .map(|(key, cached_future)| {
                let size = cached_future
                    .future
                    .clone()
                    .now_or_never()
                    .map_or(0, |result| result.map_or(0, |data| data.len()));
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
    });

    Notifier::cache_accessed(Notifier::WILDCARD);

    details
}

pub fn get_cache_future(
    url: &str,
) -> Option<Shared<LocalBoxFuture<'static, Result<Vec<u8>, JsValue>>>> {
    let result = CACHE.with(|cache| {
        let cache = cache.borrow_mut();
        if let Some(cached_future) = cache.get(url) {
            *cached_future.last_accessed.borrow_mut() = Date::now();
            *cached_future.access_count.borrow_mut() += 1;
            Some(cached_future.future.clone())
        } else {
            None
        }
    });

    Notifier::cache_accessed(url);

    result
}

pub fn insert_cache_future(
    url: &str,
    future: Shared<LocalBoxFuture<'static, Result<Vec<u8>, JsValue>>>,
) {
    CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        let cached_future = CachedFuture {
            future: future.clone(),
            added_at: Date::now(),
            last_accessed: RefCell::new(Date::now()),
            access_count: RefCell::new(1),
        };
        cache.insert(url.to_string(), cached_future);
    });

    Notifier::cache_entry_inserted(url);
}

pub fn remove_cache_entry(key: &str) {
    CACHE.with(|cache| {
        cache.borrow_mut().remove(key);
    });

    Notifier::cache_entry_removed(key);
}

pub fn clear_cache() {
    CACHE.with(|cache| {
        cache.borrow_mut().clear();
    });

    Notifier::cache_cleared();
}
