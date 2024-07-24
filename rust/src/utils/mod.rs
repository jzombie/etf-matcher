mod decrypt;
mod notifier;

pub mod cache;
pub mod fetch_and_decompress;
pub mod parse;
pub mod shard; // TODO: Remove
pub mod shard_ng;
pub mod xhr_fetch;
pub mod ticker_utils;
mod extract_logo_filename;

// Re-export cache methods to be accessible from other modules
pub use cache::{get_cache_future, insert_cache_future, remove_cache_entry};

// Re-export to avoid doubled-up "extract_logo_filename::extract_logo_filename" in consumers
pub use extract_logo_filename::extract_logo_filename;
pub use xhr_fetch::xhr_fetch;
