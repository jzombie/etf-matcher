use futures::future::LocalBoxFuture;
use futures::future::Shared;
use futures::FutureExt;
use js_sys::Date;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::Arc;
use wasm_bindgen::prelude::*;

use super::notifier::Notifier;

type SharedCacheData = Arc<Vec<u8>>;
type SharedCacheFutureType = LocalBoxFuture<'static, Result<SharedCacheData, JsValue>>;
type SharedCacheFuture = Shared<SharedCacheFutureType>;

// Global cache with futures for pending requests
thread_local! {
    pub static SHARED_CACHE: RefCell<HashMap<String, SharedCachedFuture>> = RefCell::new(HashMap::new());
}

pub fn get_shared_cache_size() -> usize {
    let size = SHARED_CACHE.with(|cache| {
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

    Notifier::network_cache_accessed(Notifier::WILDCARD);

    size
}

pub struct SharedCachedFuture {
    pub future: SharedCacheFuture,
    #[allow(dead_code)]
    pub added_at: f64,
    pub last_accessed: RefCell<f64>,
    pub access_count: RefCell<u32>,
}

#[derive(Serialize)]
pub struct SharedCacheEntry {
    pub name: String,
    pub size: usize,
    pub age: f64,           // Age in milliseconds
    pub last_accessed: f64, // Last accessed time in milliseconds since UNIX_EPOCH
    pub access_count: u32,  // Number of times accessed
}

pub fn get_shared_cache_details() -> JsValue {
    let details = SHARED_CACHE.with(|cache| {
        let cache = cache.borrow();
        let now = Date::now();
        let details: Vec<SharedCacheEntry> = cache
            .iter()
            .map(|(name, cached_future)| {
                let size = cached_future
                    .future
                    .clone()
                    .now_or_never()
                    .map_or(0, |result| result.map_or(0, |data| data.len()));
                let age = now - cached_future.added_at;
                let last_accessed = now - *cached_future.last_accessed.borrow();
                let access_count = *cached_future.access_count.borrow();
                SharedCacheEntry {
                    name: name.clone(),
                    size,
                    age,
                    last_accessed,
                    access_count,
                }
            })
            .collect();
        serde_wasm_bindgen::to_value(&details).unwrap()
    });

    Notifier::network_cache_accessed(Notifier::WILDCARD);

    details
}

pub fn get_shared_cache_future(url: &str) -> Option<SharedCacheFuture> {
    let result = SHARED_CACHE.with(|cache| {
        let cache = cache.borrow_mut();
        if let Some(cached_future) = cache.get(url) {
            *cached_future.last_accessed.borrow_mut() = Date::now();
            *cached_future.access_count.borrow_mut() += 1;
            Some(cached_future.future.clone())
        } else {
            None
        }
    });

    Notifier::network_cache_accessed(url);

    result
}

pub fn insert_shared_cache_future(url: &str, future: SharedCacheFuture) {
    SHARED_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        let cached_future = SharedCachedFuture {
            future: future.clone(),
            added_at: Date::now(),
            last_accessed: RefCell::new(Date::now()),
            access_count: RefCell::new(1),
        };
        cache.insert(url.to_string(), cached_future);
    });

    Notifier::network_cache_entry_inserted(url);
}

pub fn remove_shared_cache_entry(key: &str) {
    SHARED_CACHE.with(|cache| {
        cache.borrow_mut().remove(key);
    });

    Notifier::network_cache_entry_removed(key);
}

pub fn clear_shared_cache() {
    SHARED_CACHE.with(|cache| {
        cache.borrow_mut().clear();
    });

    Notifier::network_cache_cleared();
}
