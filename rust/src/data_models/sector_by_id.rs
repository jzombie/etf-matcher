use crate::data_models::DataURL;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct SectorById {
    pub sector_id: i32,
    pub sector_name: String,
}

impl SectorById {
    pub async fn get_sector_name_with_id(sector_id: i32) -> Result<String, JsValue> {
        let url: &str = &DataURL::SectorByIdIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<SectorById> = parse_csv_data(csv_string.as_bytes())?;

        // Find the matching record
        data.into_iter()
            .find(|sector| sector.sector_id == sector_id)
            .map(|sector| sector.sector_name)
            .ok_or_else(|| JsValue::from_str("Symbol ID not found"))
    }
}
