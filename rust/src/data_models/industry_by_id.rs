use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use crate::data_models::DataURL;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::types::IndustryId;
use crate::JsValue;

lazy_static! {
    static ref INDUSTRY_NAME_BY_ID_CACHE: Mutex<HashMap<IndustryId, String>> = Mutex::new(HashMap::new());
}

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
        if let Some(industry_name) = cache.get(&industry_id) {
            return Ok(industry_name.clone());
        }

        Err(JsValue::from_str("Industry ID not found"))
    }

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
            cache.insert(industry.industry_id, industry.industry_name);
        }

        Ok(())
    }
}
