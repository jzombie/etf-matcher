use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::utils::fetch::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::data_models::DataURL;

#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolById {
    pub ticker_id: i32,
    pub symbol: String,
    // "null" represented values are -1, as preprocessed by data exporter
    pub exchange_id: i32,
}

impl SymbolById {
    pub async fn get_symbol_by_id(ticker_id: i32) -> Result<String, JsValue> {
        let url: &str = &DataURL::SymbolByIdShardIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        
        // Parse the CSV data
        let data: Vec<SymbolById> = parse_csv_data(csv_string.as_bytes())?;

        // Find the matching record
        data.into_iter()
            .find(|symbol| symbol.ticker_id == ticker_id)
            .map(|symbol| symbol.symbol)
            .ok_or_else(|| JsValue::from_str("Symbol ID or Exchange ID not found"))
    }
}
