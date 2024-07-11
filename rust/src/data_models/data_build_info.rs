use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::utils::fetch::fetch_and_decompress_gz_non_cached;
use crate::utils::parse::parse_csv_data;
use crate::data_models::DataURL;

#[derive(Serialize, Deserialize)]
pub struct DataBuildInfo {
    pub time: String,
    pub hash: String,
}

impl DataBuildInfo {
    pub async fn get_data_build_info() -> Result<DataBuildInfo, JsValue> {
        let url: &str = &DataURL::DataBuildInfo.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz_non_cached(&url).await?;
        
        // Parse the CSV data
        let mut data: Vec<DataBuildInfo> = parse_csv_data(&csv_data)?;
        
        // Expecting a single record
        data.pop().ok_or_else(|| JsValue::from_str("No data found"))
    }
}
