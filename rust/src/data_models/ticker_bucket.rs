use crate::types::TickerId;
use csv::{Reader, Writer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error as StdError;
use std::io::{self, ErrorKind};

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

    pub fn csv_to_ticker_buckets(csv_data: &str) -> Result<Vec<TickerBucket>, Box<dyn StdError>> {
        let mut rdr = Reader::from_reader(csv_data.as_bytes());
        let mut buckets_map: HashMap<String, TickerBucket> = HashMap::new();

        for result in rdr.records() {
            let record = result?;

            // Use constants to reference the fields
            let uuid = record
                .get(0)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_BUCKET_UUID),
                    )
                })?
                .to_string();

            let name = record
                .get(1)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_BUCKET_NAME),
                    )
                })?
                .to_string();

            let bucket_type = record
                .get(2)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_BUCKET_TYPE),
                    )
                })?
                .to_string();

            let description = record
                .get(3)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_BUCKET_DESCRIPTION),
                    )
                })?
                .to_string();

            let is_user_configurable: bool = record
                .get(4)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_BUCKET_CONFIGURABLE),
                    )
                })?
                .parse()?;

            let ticker_id: TickerId = record
                .get(5)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_TICKER_ID),
                    )
                })?
                .parse()?;

            let symbol = record
                .get(6)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_TICKER_SYMBOL),
                    )
                })?
                .to_string();

            let exchange_short_name = record
                .get(7)
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty());

            let quantity: f32 = record
                .get(8)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        format!("Missing field: {}", CSV_HEADER_TICKER_QUANTITY),
                    )
                })?
                .parse()?;

            let ticker = TickerBucketTicker {
                ticker_id,
                symbol,
                exchange_short_name,
                quantity,
            };

            // Group tickers by their bucket
            let bucket = buckets_map.entry(name.clone()).or_insert(TickerBucket {
                uuid,
                name,
                bucket_type,
                description,
                is_user_configurable,
                tickers: Vec::new(),
            });

            bucket.tickers.push(ticker);
        }

        // Collect the buckets into a vector
        Ok(buckets_map.into_values().collect())
    }
}
