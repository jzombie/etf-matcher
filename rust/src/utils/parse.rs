use serde::de::DeserializeOwned;
use wasm_bindgen::prelude::*;
use csv::ReaderBuilder;

pub fn parse_csv_data<T: DeserializeOwned>(csv_data: &str) -> Result<Vec<T>, JsValue> {
    let mut reader = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(csv_data.as_bytes());

    let mut results = Vec::new();
    for result in reader.deserialize() {
        let record: T = result.map_err(|err| {
            JsValue::from_str(&format!("Failed to parse CSV: {}", err))
        })?;
        results.push(record);
    }

    Ok(results)
}
