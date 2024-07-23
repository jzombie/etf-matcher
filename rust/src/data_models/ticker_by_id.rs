use crate::data_models::DataURL;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::types::{TickerId, ExchangeId};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerById {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_id: ExchangeId, // TODO: Convert to Option<u32> ("null" represented values are -1, as preprocessed by data exporter)
}

impl TickerById {
    pub async fn get_symbol_with_ticker_id(ticker_id: TickerId) -> Result<String, JsValue> {
        let url: &str = DataURL::TickerByIdIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<TickerById> = parse_csv_data(csv_string.as_bytes())?;

        // Find the matching record
        data.into_iter()
            .find(|ticker| ticker.ticker_id == ticker_id)
            .map(|ticker| ticker.symbol)
            .ok_or_else(|| JsValue::from_str("Symbol ID not found"))
    }

    pub async fn get_exchange_id_with_ticker_id(ticker_id: TickerId) -> Result<ExchangeId, JsValue> {
        let url: &str = DataURL::TickerByIdIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<TickerById> = parse_csv_data(csv_string.as_bytes())?;

        // Find the matching record
        data.into_iter()
            .find(|ticker| ticker.ticker_id == ticker_id)
            .map(|ticker| ticker.exchange_id)
            .ok_or_else(|| JsValue::from_str("Symbol ID not found"))
    }

    pub async fn get_ticker_ids_with_symbol(symbol: &str) -> Result<Vec<TickerId>, JsValue> {
        let url: &str = DataURL::TickerByIdIndex.value();

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;

        // Parse the CSV data
        let data: Vec<TickerById> = parse_csv_data(csv_string.as_bytes())?;

        // Prepare the search symbol
        let search_symbol = symbol.trim().to_lowercase();

        // Find the matching records
        let ticker_ids: Vec<TickerId> = data.into_iter()
            .filter(|ticker| ticker.symbol.trim().to_lowercase() == search_symbol)
            .map(|ticker| ticker.ticker_id)
            .collect();

        if ticker_ids.is_empty() {
            Err(JsValue::from_str("Symbol not found"))
        } else {
            Ok(ticker_ids)
        }
    }
}
