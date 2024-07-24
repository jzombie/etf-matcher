use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ShardIndexEntry<T> {
    pub shard_file: String,
    pub first_id: T,
    pub last_id: T,
}

async fn parse_shard_index<T>(shard_index_url: &str) -> Result<Vec<ShardIndexEntry<T>>, JsValue>
where
    T: DeserializeOwned,
{
    let csv_data = fetch_and_decompress_gz(shard_index_url, true).await?;
    let csv_string = String::from_utf8(csv_data)
        .map_err(|err| JsValue::from_str(&format!("Failed to convert data to String: {}", err)))?;
    let entries: Vec<ShardIndexEntry<T>> = parse_csv_data(csv_string.as_bytes())?;
    Ok(entries)
}

fn find_shard_for_value<'a, T>(
    value: &T,
    shard_index: &'a [ShardIndexEntry<T>],
) -> Option<&'a ShardIndexEntry<T>>
where
    T: PartialOrd,
{
    shard_index.iter().find(|&entry| value >= &entry.first_id && value <= &entry.last_id)
}

async fn fetch_and_parse_shard<T>(shard_url: &str) -> Result<Vec<T>, JsValue>
where
    T: DeserializeOwned,
{
    let csv_data = fetch_and_decompress_gz(shard_url, true).await?;
    let csv_string = String::from_utf8(csv_data)
        .map_err(|err| JsValue::from_str(&format!("Failed to convert data to String: {}", err)))?;
    let entries: Vec<T> = parse_csv_data(csv_string.as_bytes())?;
    Ok(entries)
}


pub async fn query_shard_for_value<T, F, V>(
    shard_index_url: &str,
    value: &V,
    get_value: F,
) -> Result<Option<T>, JsValue>
where
    T: DeserializeOwned,
    V: PartialOrd + DeserializeOwned,
    F: Fn(&T) -> Option<&V>,
{
    // Parse the shard index
    let shard_index: Vec<ShardIndexEntry<V>> = parse_shard_index(shard_index_url).await?;

    // Find the appropriate shard for the given value
    if let Some(shard_entry) = find_shard_for_value(value, &shard_index) {
        // Determine the base path from the shard_index_url
        let base_path: &str = if let Some(pos) = shard_index_url.rfind('/') {
            &shard_index_url[..pos + 1]
        } else {
            ""
        };

        // Construct the full URL for the shard file
        let shard_file_url: String = format!("{}{}", base_path, shard_entry.shard_file);

        // Fetch and parse the shard
        let shard_data: Vec<T> = fetch_and_parse_shard(&shard_file_url).await?;

        // Find the specific entry in the shard
        for entry in shard_data {
            if get_value(&entry) == Some(value) {
                return Ok(Some(entry));
            }
        }
    }

    Ok(None)
}
