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

// Data is immutable because it's wrapped in an Arc.
type NetworkCacheData = Arc<Vec<u8>>;

// The Future is shared and the data inside it is immutable.
type NetworkCacheFutureType = LocalBoxFuture<'static, Result<NetworkCacheData, JsValue>>;
type NetworkCacheFuture = Shared<NetworkCacheFutureType>;

// Global cache with futures for pending requests
thread_local! {
    pub static NETWORK_CACHE: RefCell<HashMap<String, NetworkCachedFuture>> = RefCell::new(HashMap::new());
}

pub fn get_cache_size() -> usize {
    let size = NETWORK_CACHE.with(|cache| {
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

pub struct NetworkCachedFuture {
    pub future: NetworkCacheFuture, // The future's result is immutable.
    #[allow(dead_code)]
    pub added_at: f64,
    pub last_accessed: RefCell<f64>,
    pub access_count: RefCell<u32>,
}

#[derive(Serialize)]
pub struct NetworkCacheEntry {
    pub name: String,
    pub size: usize,
    pub age: f64,           // Age in milliseconds
    pub last_accessed: f64, // Last accessed time in milliseconds since UNIX_EPOCH
    pub access_count: u32,  // Number of times accessed
}

pub fn get_cache_details() -> JsValue {
    let details = NETWORK_CACHE.with(|cache| {
        let cache = cache.borrow();
        let now = Date::now();
        let details: Vec<NetworkCacheEntry> = cache
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
                NetworkCacheEntry {
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

// Function to retrieve a future from the cache.
pub fn get_cache_future(url: &str) -> Option<NetworkCacheFuture> {
    let result = NETWORK_CACHE.with(|cache| {
        let cache = cache.borrow_mut();
        if let Some(cached_future) = cache.get(url) {
            *cached_future.last_accessed.borrow_mut() = Date::now();
            *cached_future.access_count.borrow_mut() += 1;

            // Cloning the NetworkCacheFuture here does not duplicate the underlying data.
            // Instead, it increments the reference count of the Arc that manages the shared
            // future. This allows multiple consumers to share the same future without copying
            // the data or recomputing the future's result.
            Some(cached_future.future.clone())
        } else {
            None
        }
    });

    Notifier::network_cache_accessed(url);

    result
}

// Function to insert a new future into the cache.
pub fn insert_cache_future(url: &str, future: NetworkCacheFuture) {
    NETWORK_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        let cached_future = NetworkCachedFuture {
            future: future.clone(),
            added_at: Date::now(),
            last_accessed: RefCell::new(Date::now()),
            access_count: RefCell::new(1),
        };
        cache.insert(url.to_string(), cached_future);
    });

    Notifier::network_cache_entry_inserted(url);
}

// Function to remove an entry from the cache.
pub fn remove_cache_entry(key: &str) {
    NETWORK_CACHE.with(|cache| {
        cache.borrow_mut().remove(key);
    });

    Notifier::network_cache_entry_removed(key);
}

// Function to clear the entire cache.
pub fn clear_cache() {
    NETWORK_CACHE.with(|cache| {
        cache.borrow_mut().clear();
    });

    Notifier::network_cache_cleared();
}
