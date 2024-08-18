use crate::types::SectorId;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::DataURL;
use crate::JsValue;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

lazy_static! {
    static ref SECTOR_NAME_BY_ID_CACHE: Mutex<HashMap<SectorId, String>> =
        Mutex::new(HashMap::new());
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SectorById {
    pub sector_id: SectorId,
    pub sector_name: String,
}

impl SectorById {
    pub async fn get_sector_name_with_id(sector_id: SectorId) -> Result<String, JsValue> {
        // Ensure cache is preloaded
        if SECTOR_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
            Self::preload_sector_name_cache().await?;
        }

        // Check if the result is already in the cache
        let cache = SECTOR_NAME_BY_ID_CACHE.lock().unwrap();
        if let Some(sector_name) = cache.get(&sector_id) {
            return Ok(sector_name.clone());
        }

        Err(JsValue::from_str("Sector ID not found"))
    }

    async fn preload_sector_name_cache() -> Result<(), JsValue> {
        // Fetch and decompress the CSV data
        let url = DataURL::SectorByIdIndex.value();
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<SectorById> = parse_csv_data(csv_string.as_bytes())?;

        // Load data into cache
        let mut cache = SECTOR_NAME_BY_ID_CACHE.lock().unwrap();
        for sector in data {
            cache.insert(sector.sector_id, sector.sector_name);
        }

        Ok(())
    }
}
