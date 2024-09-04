use crate::types::TickerId;
use serde::{Deserialize, Serialize};

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

// This is the new wrapper struct to match your JSON structure
#[derive(Serialize, Deserialize, Debug)]
pub struct TickerBucketWrapper {
    pub ticker_buckets: Vec<TickerBucket>,
}

impl TickerBucket {
    pub fn ticker_buckets_to_csv(buckets: Vec<TickerBucket>) -> String {
        // TODO: Use proper CSV handling

        let mut csv_data =
            String::from("Name,Type,Description,Configurable,TickerId,Symbol,Exchange,Quantity\n");

        for bucket in buckets {
            for ticker in bucket.tickers {
                csv_data.push_str(&format!(
                    "{},{},{},{},{},{},{:?},{}\n",
                    bucket.name,
                    bucket.bucket_type,
                    bucket.description,
                    bucket.is_user_configurable,
                    ticker.ticker_id,
                    ticker.symbol,
                    ticker.exchange_short_name.unwrap_or_default(),
                    ticker.quantity
                ));
            }
        }

        web_sys::console::log_1(&csv_data.clone().into());
        csv_data
    }
}
