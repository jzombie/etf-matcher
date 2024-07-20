pub struct Notifier;

// TODO: Replace all console calls with JS callbacks
impl Notifier {
    pub const WILDCARD: &'static str = "*";

    pub fn xhr_request_created(url: &str) {
        web_sys::console::log_1(&format!("XHR request created: {}", url).into());
    }

    pub fn xhr_request_opened(url: &str) {
        web_sys::console::log_1(&format!("XHR request opened: {}", url).into());
    }

    pub fn xhr_request_sent(url: &str) {
        web_sys::console::log_1(&format!("XHR request sent: {}", url).into());
    }

    pub fn xhr_request_error(url: &str) {
        web_sys::console::error_1(&format!("XHR request error: {}", url).into());
    }

    pub fn cache_accessed(key: &str) {
        web_sys::console::log_1(&format!("Cache accessed: {}", key).into());
    }

    pub fn cache_inserted(key: &str) {
        web_sys::console::log_1(&format!("Cache inserted: {}", key).into());
    }

    pub fn cache_entry_removed(key: &str) {
        web_sys::console::log_1(&format!("Cache entry removed: {}", key).into());
    }

    pub fn cache_cleared() {
        web_sys::console::log_1(&"Cache cleared".into());
    }
}
