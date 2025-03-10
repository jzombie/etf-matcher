use wasm_bindgen::prelude::*;

// Declare the external JavaScript function
#[wasm_bindgen]
extern "C" {
    fn rustNotifyCallback(event_type: &str, args: &JsValue);
}

pub struct Notifier;

impl Notifier {
    pub const WILDCARD: &'static str = "*";

    fn call_notify(event_type: &str, args: &[&str]) {
        let array = js_sys::Array::new();
        for &arg in args {
            array.push(&JsValue::from(arg));
        }
        rustNotifyCallback(event_type, &array.into());
    }

    pub fn xhr_request_created(url: &str) {
        Self::call_notify("xhr_request_created", &[url]);
    }

    pub fn xhr_request_opened(url: &str) {
        Self::call_notify("xhr_request_opened", &[url]);
    }

    pub fn xhr_request_sent(url: &str) {
        Self::call_notify("xhr_request_sent", &[url]);
    }

    pub fn xhr_request_error(url: &str) {
        Self::call_notify("xhr_request_error", &[url]);
    }

    pub fn network_cache_accessed(key: &str) {
        Self::call_notify("network_cache_accessed", &[key]);
    }

    pub fn network_cache_entry_inserted(key: &str) {
        Self::call_notify("network_cache_entry_inserted", &[key]);
    }

    pub fn network_cache_entry_removed(key: &str) {
        Self::call_notify("cache_entry_removed", &[key]);
    }

    pub fn network_cache_cleared() {
        Self::call_notify("network_cache_cleared", &[]);
    }
}
