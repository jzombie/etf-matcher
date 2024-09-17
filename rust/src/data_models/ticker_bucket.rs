use crate::types::TickerId;
use csv::{Reader, Writer};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error as StdError;
use std::io::{self, ErrorKind};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TickerBucket {
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

impl TickerBucket {
    pub fn ticker_buckets_to_csv(buckets: Vec<TickerBucket>) -> String {
        let mut wtr = Writer::from_writer(vec![]);

        // Write the header row
        wtr.write_record(&[
            "Name",
            "Type",
            "Description",
            "Configurable",
            "TickerId",
            "Symbol",
            "Exchange",
            "Quantity",
        ])
        .expect("Failed to write header");

        // Write the data rows
        for bucket in buckets {
            for ticker in &bucket.tickers {
                wtr.write_record(&[
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

            // Dynamically retrieve each field and return error if missing
            let name = record
                .get(0)
                .ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "Missing 'Name' field in CSV")
                })?
                .to_string();

            let bucket_type = record
                .get(1)
                .ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "Missing 'Type' field in CSV")
                })?
                .to_string();

            let description = record
                .get(2)
                .ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "Missing 'Description' field in CSV")
                })?
                .to_string();

            let is_user_configurable: bool = record
                .get(3)
                .ok_or_else(|| {
                    io::Error::new(
                        ErrorKind::InvalidData,
                        "Missing 'Configurable' field in CSV",
                    )
                })?
                .parse()?;

            let ticker_id: TickerId = record
                .get(4)
                .ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "Missing 'TickerId' field in CSV")
                })?
                .parse()?; // Assuming TickerId implements FromStr or similar

            let symbol = record
                .get(5)
                .ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "Missing 'Symbol' field in CSV")
                })?
                .to_string();

            let exchange_short_name = record
                .get(6)
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty());

            let quantity: f32 = record
                .get(7)
                .ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "Missing 'Quantity' field in CSV")
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
