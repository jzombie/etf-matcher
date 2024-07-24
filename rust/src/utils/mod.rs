mod decrypt;
mod notifier;

pub mod cache;
pub mod fetch_and_decompress;
pub mod parse;
pub mod shard; // TODO: Remove
pub mod shard_ng;
pub mod ticker_utils;

pub mod logo_utils;
pub use logo_utils::extract_logo_filename;

pub mod xhr_utils;
pub use xhr_utils::xhr_fetch;

// Re-export cache methods to be accessible from other modules
pub use cache::{get_cache_future, insert_cache_future, remove_cache_entry};

