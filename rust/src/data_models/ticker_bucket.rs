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
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub quantity: f32,
}

const CSV_HEADER_BUCKET_UUID: &str = "bucket_uuid";
const CSV_HEADER_BUCKET_NAME: &str = "bucket_name";
const CSV_HEADER_BUCKET_TYPE: &str = "bucket_type";
const CSV_HEADER_BUCKET_DESCRIPTION: &str = "bucket_description";
const CSV_HEADER_BUCKET_CONFIGURABLE: &str = "bucket_configurable";
const CSV_HEADER_TICKER_ID: &str = "ticker_id";
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
            CSV_HEADER_TICKER_ID,
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
                    &ticker.ticker_id.to_string(),
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

        let mut ticker_map: HashMap<(String, Option<u32>), Vec<(TickerId, Option<String>)>> =
            HashMap::new();
        for ticker in all_tickers {
            let exchange_short_name = match ticker.exchange_id {
                Some(exchange_id) => {
                    let short_name = ExchangeById::get_short_name_by_exchange_id(exchange_id)
                        .await
                        .ok();
                    short_name
                }
                None => None,
            };

            // Use a tuple of (symbol, exchange_id) as the key
            let key = (ticker.symbol.clone(), ticker.exchange_id);
            let entry = ticker_map.entry(key).or_insert_with(Vec::new);
            entry.push((ticker.ticker_id, exchange_short_name));
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

            let symbol =
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

            // Use the symbol and exchange_short_name as the key for lookup
            let (ticker_id, _) = match ticker_map.iter().find_map(|((sym, _), entries)| {
                if sym == symbol {
                    entries
                        .iter()
                        .find(|(_, exch_short_name)| {
                            exch_short_name.as_deref() == Some(&exchange_short_name)
                        })
                        .map(|(id, _)| *id)
                } else {
                    None
                }
            }) {
                Some(id) => (id, Some(exchange_short_name.clone())),
                None => {
                    return Err(JsValue::from_str(&format!(
                        "Error: Ticker symbol {} not found in the system",
                        symbol
                    )))
                }
            };

            let ticker = TickerBucketTicker {
                ticker_id,
                symbol: symbol.to_string(),
                exchange_short_name: Some(exchange_short_name),
                quantity,
            };

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
