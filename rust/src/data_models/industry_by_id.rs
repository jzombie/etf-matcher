use crate::data_models::DataURL;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::types::IndustryId;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct IndustryById {
    pub industry_id: IndustryId,
    pub industry_name: String,
}

impl IndustryById {
    // TODO: Use cache preloading
    pub async fn get_industry_name_with_id(industry_id: IndustryId) -> Result<String, JsValue> {
        let url: &str = DataURL::IndustryByIdIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<IndustryById> = parse_csv_data(csv_string.as_bytes())?;

        // Find the matching record
        data.into_iter()
            .find(|industry| industry.industry_id == industry_id)
            .map(|industry| industry.industry_name)
            .ok_or_else(|| JsValue::from_str("Industry ID not found"))
    }
}
