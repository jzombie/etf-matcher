use crate::data_models::DataURL;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DataBuildInfo {
    pub time: DateTime<Utc>, // ISO 8601 timestamp
    pub hash: String,
}

impl DataBuildInfo {
    pub async fn get_data_build_info() -> Result<DataBuildInfo, JsValue> {
        let url: &str = &DataURL::DataBuildInfo.value();

        // Fetch and decompress the CSV data, skipping the cache
        let csv_data = fetch_and_decompress_gz(&url, false).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let mut data: Vec<DataBuildInfo> = parse_csv_data(csv_string.as_bytes())?;

        // Expecting a single record
        data.pop().ok_or_else(|| JsValue::from_str("No data found"))
    }
}
