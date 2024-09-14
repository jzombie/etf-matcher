use csv::ReaderBuilder;
use serde::de::DeserializeOwned;
use wasm_bindgen::prelude::*;
use web_sys::console;

pub fn parse_csv_data<T: DeserializeOwned>(csv_data: &[u8]) -> Result<Vec<T>, JsValue> {
    let mut reader = ReaderBuilder::new().has_headers(true).from_reader(csv_data);

    let mut results = Vec::new();

    // Keep track of the record number
    for (record_index, result) in reader.deserialize().enumerate() {
        match result {
            Ok(record) => {
                results.push(record);
            }
            Err(err) => {
                // Get position information
                let position = err.position().clone();

                // Log detailed error information to the console
                if let Some(pos) = position {
                    console::error_1(&JsValue::from_str(&format!(
                        "Failed to parse CSV at record {} (line {}, byte {}): {}",
                        record_index + 1,
                        pos.line(),
                        pos.byte(),
                        err
                    )));

                    // Create a new CSV reader to read the specific record
                    let mut record_reader =
                        ReaderBuilder::new().has_headers(true).from_reader(csv_data);

                    let mut records = record_reader.records();

                    // Skip to the problematic record
                    for _ in 0..pos.record() {
                        records.next();
                    }
                    if let Some(Ok(raw_record)) = records.next() {
                        let raw_record_str = format!("Raw record: {:?}", raw_record);
                        console::error_1(&JsValue::from_str(&raw_record_str));
                    }
                } else {
                    // Position is None, log the error without position
                    console::error_1(&JsValue::from_str(&format!("Failed to parse CSV: {}", err)));
                }

                return Err(JsValue::from_str(&format!("Failed to parse CSV: {}", err)));
            }
        }
    }

    Ok(results)
}
