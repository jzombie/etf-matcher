pub struct Notifier;

impl Notifier {
    pub fn cache_accessed() {
        web_sys::console::log_1(&"Cache accessed".into());
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
