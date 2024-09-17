use crate::types::TickerId;
use csv::{Reader, Writer};
use serde::{Deserialize, Serialize};
use std::error::Error;

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

    pub fn csv_to_ticker_buckets(csv_data: &str) -> Result<Vec<TickerBucket>, Box<dyn Error>> {
        let mut rdr = Reader::from_reader(csv_data.as_bytes());
        let mut buckets_map: std::collections::HashMap<String, TickerBucket> =
            std::collections::HashMap::new();

        for result in rdr.records() {
            let record = result?;

            let name = record[0].to_string();
            let bucket_type = record[1].to_string();
            let description = record[2].to_string();
            let is_user_configurable: bool = record[3].parse()?;
            let ticker_id: TickerId = record[4].parse()?; // Assuming TickerId implements FromStr or similar
            let symbol = record[5].to_string();
            let exchange_short_name = if record[6].is_empty() {
                None
            } else {
                Some(record[6].to_string())
            };
            let quantity: f32 = record[7].parse()?;

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
