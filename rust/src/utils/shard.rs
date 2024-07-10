use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::utils::fetch::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use web_sys::console;
use url::Url;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShardIndexEntry {
    pub shard_file: String,
    pub first_symbol: String,
    pub last_symbol: String,
}

pub async fn parse_shard_index(shard_index_url: &str) -> Result<Vec<ShardIndexEntry>, JsValue> {
    let csv_data: String = fetch_and_decompress_gz(shard_index_url).await?;
    let entries: Vec<ShardIndexEntry> = parse_csv_data(&csv_data)?;
    Ok(entries)
}

pub fn find_shard_for_symbol<'a>(symbol: &str, shard_index: &'a [ShardIndexEntry]) -> Option<&'a ShardIndexEntry> {
    for entry in shard_index {
        if symbol >= entry.first_symbol.as_str() && symbol <= entry.last_symbol.as_str() {
            return Some(entry);
        }
    }
    None
}

pub async fn fetch_and_parse_shard<T>(shard_url: &str) -> Result<Vec<T>, JsValue>
where
    T: DeserializeOwned,
{
    let csv_data: String = fetch_and_decompress_gz(shard_url).await?;
    let entries: Vec<T> = parse_csv_data(&csv_data)?;
    Ok(entries)
}

pub async fn query_shard_for_symbol<T, F>(
    shard_index_url: &str,
    symbol: &str,
    get_symbol: F,
) -> Result<Option<T>, JsValue>
where
    T: DeserializeOwned,
    F: Fn(&T) -> Option<&str>,
{
    // Parse the shard index
    let shard_index = parse_shard_index(shard_index_url).await?;

    // Find the appropriate shard for the given symbol
    if let Some(shard_entry) = find_shard_for_symbol(symbol, &shard_index) {
        // Determine the base path from the shard_index_url
        let base_path = if let Some(pos) = shard_index_url.rfind('/') {
            &shard_index_url[..pos + 1]
        } else {
            ""
        };

        // Construct the full URL for the shard file
        let shard_file_url = format!("{}{}", base_path, shard_entry.shard_file);

        // Fetch and parse the shard
        let shard_data: Vec<T> = fetch_and_parse_shard(&shard_file_url).await?;

        // Find the specific entry in the shard
        for entry in shard_data {
            if get_symbol(&entry) == Some(symbol) {
                console::debug_1(&JsValue::from_str("Got symbol match..."));

                return Ok(Some(entry));
            }
        }
    }

    Ok(None)
}