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
    static ref SECTOR_NAME_BY_ID_CACHE: Mutex<HashMap<SectorId, SectorById>> =
        Mutex::new(HashMap::new());
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SectorById {
    pub sector_id: SectorId,
    pub sector_name: String,
    pub major_sector_id: Option<SectorId>,
    pub major_sector_name: Option<String>,
}

impl SectorById {
    pub async fn get_sector_name_with_id(sector_id: SectorId) -> Result<String, JsValue> {
        // Ensure cache is preloaded
        if SECTOR_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
            Self::preload_sector_name_cache().await?;
        }

        // Check if the result is already in the cache
        let cache = SECTOR_NAME_BY_ID_CACHE.lock().unwrap();
        if let Some(sector) = cache.get(&sector_id) {
            return Ok(sector.sector_name.clone());
        }

        Err(JsValue::from_str("Sector ID not found"))
    }

    pub async fn get_major_sector_name_with_id(
        major_sector_id: SectorId,
    ) -> Result<String, JsValue> {
        // Ensure cache is preloaded
        if SECTOR_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
            Self::preload_sector_name_cache().await?;
        }

        // Check if the major sector is in the cache
        let cache = SECTOR_NAME_BY_ID_CACHE.lock().unwrap();
        for sector in cache.values() {
            if let (Some(id), Some(name)) =
                (sector.major_sector_id, sector.major_sector_name.as_ref())
            {
                if id == major_sector_id {
                    return Ok(name.clone());
                }
            }
        }

        Err(JsValue::from_str("Major Sector ID not found"))
    }

    // TODO: Uncomment?
    // pub async fn get_all_sectors() -> Result<HashMap<SectorId, String>, JsValue> {
    //     // Ensure cache is preloaded
    //     if SECTOR_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
    //         Self::preload_sector_name_cache().await?;
    //     }

    //     // Return all sector names
    //     let cache = SECTOR_NAME_BY_ID_CACHE.lock().unwrap();
    //     let sectors = cache
    //         .iter()
    //         .map(|(id, sector)| (*id, sector.sector_name.clone()))
    //         .collect();
    //     Ok(sectors)
    // }

    pub async fn get_all_major_sectors() -> Result<HashMap<SectorId, String>, JsValue> {
        // Ensure cache is preloaded
        if SECTOR_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
            Self::preload_sector_name_cache().await?;
        }

        // Create a map for major sectors
        let mut major_sector_cache = HashMap::new();

        // Access the cache to populate the major sector data
        let cache = SECTOR_NAME_BY_ID_CACHE.lock().unwrap();
        for (_, sector) in cache.iter() {
            if let (Some(major_sector_id), Some(major_sector_name)) =
                (sector.major_sector_id, sector.major_sector_name.as_ref())
            {
                major_sector_cache.insert(major_sector_id, major_sector_name.clone());
            }
        }

        Ok(major_sector_cache)
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
            cache.insert(sector.sector_id, sector);
        }

        Ok(())
    }
}
