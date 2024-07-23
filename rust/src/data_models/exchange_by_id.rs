use crate::data_models::DataURL;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::types::ExchangeId;
use crate::JsValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ExchangeById {
    pub exchange_id: ExchangeId,
    pub short_name: String,
    pub name: String
}

impl ExchangeById {
    pub async fn get_short_name_by_exchange_id(exchange_id: ExchangeId) -> Result<String, JsValue> {
        let url: &str = DataURL::ExchangeByIdIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<ExchangeById> = parse_csv_data(csv_string.as_bytes())?;

        // Find the matching record
        data.into_iter()
            .find(|exchange| exchange.exchange_id == exchange_id)
            .map(|exchange| exchange.short_name)
            .ok_or_else(|| JsValue::from_str("Exchange ID not found"))
    }
}
