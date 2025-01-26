use crate::types::IndustryId;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::DataURL;
use crate::JsValue;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

lazy_static! {
    static ref INDUSTRY_NAME_BY_ID_CACHE: Mutex<HashMap<IndustryId, IndustryById>> =
        Mutex::new(HashMap::new());
}

// TODO: Rename to Industry
#[derive(Serialize, Deserialize, Debug)]
pub struct IndustryById {
    pub industry_id: IndustryId,
    pub industry_name: String,
}

impl IndustryById {
    pub async fn get_industry_name_with_id(industry_id: IndustryId) -> Result<String, JsValue> {
        // Ensure cache is preloaded
        if INDUSTRY_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
            Self::preload_industry_name_cache().await?;
        }

        // Check if the result is already in the cache
        let cache = INDUSTRY_NAME_BY_ID_CACHE.lock().unwrap();
        if let Some(industry) = cache.get(&industry_id) {
            return Ok(industry.industry_name.clone());
        }

        Err(JsValue::from_str(&format!(
            "Industry ID {} not found",
            industry_id
        )))
    }

    // TODO: Uncomment?
    // pub async fn get_all_industries() -> Result<HashMap<IndustryId, String>, JsValue> {
    //     // Ensure cache is preloaded
    //     if INDUSTRY_NAME_BY_ID_CACHE.lock().unwrap().is_empty() {
    //         Self::preload_industry_name_cache().await?;
    //     }

    //     // Return all industry names
    //     let cache = INDUSTRY_NAME_BY_ID_CACHE.lock().unwrap();
    //     let industries = cache
    //         .iter()
    //         .map(|(id, industry)| (*id, industry.industry_name.clone()))
    //         .collect();
    //     Ok(industries)
    // }

    async fn preload_industry_name_cache() -> Result<(), JsValue> {
        // Fetch and decompress the CSV data
        let url = DataURL::IndustryByIdIndex.value();
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<IndustryById> = parse_csv_data(csv_string.as_bytes())?;

        // Load data into cache
        let mut cache = INDUSTRY_NAME_BY_ID_CACHE.lock().unwrap();
        for industry in data {
            cache.insert(industry.industry_id, industry);
        }

        Ok(())
    }
}
