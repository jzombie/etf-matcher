use wasm_bindgen::prelude::*;

// Declare the external JavaScript function
#[wasm_bindgen]
extern "C" {
    fn notify(event_type: &str, args: &JsValue);
}

pub struct Notifier;

impl Notifier {
    pub const WILDCARD: &'static str = "*";

    fn call_notify(event_type: &str, args: &[&str]) {
        let array = js_sys::Array::new();
        for &arg in args {
            array.push(&JsValue::from(arg));
        }
        notify(event_type, &array.into());
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

    pub fn cache_accessed(key: &str) {
        Self::call_notify("cache_accessed", &[key]);
    }

    pub fn cache_inserted(key: &str) {
        Self::call_notify("cache_inserted", &[key]);
    }

    pub fn cache_entry_removed(key: &str) {
        Self::call_notify("cache_entry_removed", &[key]);
    }

    pub fn cache_cleared() {
        Self::call_notify("cache_cleared", &[]);
    }
}