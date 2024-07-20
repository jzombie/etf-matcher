mod decrypt;
mod notifier;

pub mod fetch_and_decompress;
pub mod parse;
pub mod shard;
pub mod cache;
pub mod xhr_fetch;

// Re-export cache methods to be accessible from other modules
pub use cache::{get_cache_future, insert_cache_future, remove_cache_entry};

// Re-export to avoid doubled-up "uncompress_logo_filename::uncompress_logo_filename" in consumers
mod uncompress_logo_filename;
pub use uncompress_logo_filename::uncompress_logo_filename;
pub use xhr_fetch::xhr_fetch;