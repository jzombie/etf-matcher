use crate::data_models::ExchangeById;
use crate::data_models::TickerSearch;
use crate::types::TickerId;
use csv::{StringRecord, Writer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::JsValue;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TickerBucket {
    pub uuid: String,
    pub name: String,
    pub tickers: Vec<TickerBucketTicker>,
    #[serde(rename = "type")]
    pub bucket_type: String,
    pub description: String,
    pub is_user_configurable: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TickerBucketTicker {
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub quantity: f32,
}

const CSV_HEADER_BUCKET_UUID: &str = "bucket_uuid";
const CSV_HEADER_BUCKET_NAME: &str = "bucket_name";
const CSV_HEADER_BUCKET_TYPE: &str = "bucket_type";
const CSV_HEADER_BUCKET_DESCRIPTION: &str = "bucket_description";
const CSV_HEADER_BUCKET_CONFIGURABLE: &str = "bucket_configurable";
const CSV_HEADER_TICKER_SYMBOL: &str = "ticker_symbol";
const CSV_HEADER_TICKER_EXCHANGE: &str = "ticker_exchange";
const CSV_HEADER_TICKER_QUANTITY: &str = "ticker_quantity";

impl TickerBucket {
    pub fn ticker_buckets_to_csv(buckets: Vec<TickerBucket>) -> String {
        let mut wtr = Writer::from_writer(vec![]);

        // Write the header row
        wtr.write_record(&[
            CSV_HEADER_BUCKET_UUID,
            CSV_HEADER_BUCKET_NAME,
            CSV_HEADER_BUCKET_TYPE,
            CSV_HEADER_BUCKET_DESCRIPTION,
            CSV_HEADER_BUCKET_CONFIGURABLE,
            CSV_HEADER_TICKER_SYMBOL,
            CSV_HEADER_TICKER_EXCHANGE,
            CSV_HEADER_TICKER_QUANTITY,
        ])
        .expect("Failed to write header");

        // Write the data rows
        for bucket in buckets {
            for ticker in &bucket.tickers {
                wtr.write_record(&[
                    &bucket.uuid,
                    &bucket.name,
                    &bucket.bucket_type,
                    &bucket.description,
                    &bucket.is_user_configurable.to_string(),
                    &ticker.symbol,
                    &ticker.exchange_short_name.clone().unwrap_or_default(),
                    &ticker.quantity.to_string(),
                ])
                .expect("Failed to write record");
            }
        }

        // Convert the written data to a string and return it
        String::from_utf8(wtr.into_inner().expect("Failed to extract CSV data"))
            .expect("Failed to convert CSV data to UTF-8")
    }

    pub async fn csv_to_ticker_buckets(csv_data: &str) -> Result<Vec<TickerBucket>, JsValue> {
        // Fetch all available tickers once
        let all_tickers = TickerSearch::get_all_raw_results()
            .await
            .map_err(|err| JsValue::from_str(&format!("Failed to fetch tickers: {:?}", err)))?;

        // Collect all exchange IDs
        let exchange_ids: Vec<u32> = all_tickers
            .iter()
            .filter_map(|ticker| ticker.exchange_id)
            .collect();

        // Fetch all exchange short names in a batch
        let mut exchange_short_names = Vec::new();

        for &exchange_id in &exchange_ids {
            match ExchangeById::get_short_name_by_exchange_id(exchange_id).await {
                Ok(short_name) => exchange_short_names.push(short_name),
                Err(err) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to fetch exchange name for ID {}: {:?}",
                        exchange_id, err
                    )))
                }
            }
        }

        // Create a mapping from exchange_id to exchange_short_name
        let exchange_short_name_map: HashMap<u32, String> = exchange_ids
            .into_iter()
            .zip(exchange_short_names.into_iter())
            .collect();

        // Create a map to associate symbols and exchange short names with ticker IDs
        let mut ticker_map: HashMap<(String, String), TickerId> = HashMap::new();
        for ticker in all_tickers {
            let exchange_short_name = ticker
                .exchange_id
                .and_then(|id| exchange_short_name_map.get(&id).cloned())
                .unwrap_or_default();

            let key = (ticker.symbol.clone(), exchange_short_name.clone());
            ticker_map.insert(key, ticker.ticker_id);
        }

        let mut rdr = csv::Reader::from_reader(csv_data.as_bytes());
        let headers = rdr
            .headers()
            .map_err(|err| JsValue::from_str(&format!("Failed to read CSV headers: {:?}", err)))?
            .clone();

        let mut buckets_map: HashMap<String, TickerBucket> = HashMap::new();

        for result in rdr.records() {
            let record = result.map_err(|err| {
                JsValue::from_str(&format!("Failed to read CSV record: {:?}", err))
            })?;

            let uuid = TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_BUCKET_UUID)?
                .to_string();
            let name = TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_BUCKET_NAME)?
                .to_string();
            let bucket_type =
                TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_BUCKET_TYPE)?
                    .to_string();
            let description =
                TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_BUCKET_DESCRIPTION)?
                    .to_string();
            let is_user_configurable =
                TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_BUCKET_CONFIGURABLE)?
                    .parse::<bool>()
                    .map_err(|err| {
                        JsValue::from_str(&format!("Failed to parse boolean: {:?}", err))
                    })?;

            let ticker_symbol =
                TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_TICKER_SYMBOL)?;
            let exchange_short_name =
                TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_TICKER_EXCHANGE)?
                    .to_string();
            let quantity =
                TickerBucket::get_field_by_name(&record, &headers, CSV_HEADER_TICKER_QUANTITY)?
                    .parse::<f32>()
                    .map_err(|err| {
                        JsValue::from_str(&format!("Failed to parse quantity: {:?}", err))
                    })?;

            let ticker = TickerBucketTicker {
                symbol: ticker_symbol.to_string(),
                exchange_short_name: Some(exchange_short_name),
                quantity,
            };

            // Group tickers by their bucket
            let bucket = buckets_map.entry(uuid.clone()).or_insert(TickerBucket {
                uuid,
                name,
                bucket_type,
                description,
                is_user_configurable,
                tickers: Vec::new(),
            });

            bucket.tickers.push(ticker);
        }

        Ok(buckets_map.into_values().collect())
    }

    fn get_field_by_name<'a>(
        record: &'a StringRecord,
        headers: &'a StringRecord,
        field_name: &str,
    ) -> Result<&'a str, JsValue> {
        headers
            .iter()
            .position(|header| header == field_name)
            .and_then(|idx| record.get(idx))
            .ok_or_else(|| JsValue::from_str(&format!("Missing field: {}", field_name)))
    }
}
