use serde::{Deserialize, Serialize};

pub type TickerId = u32;
pub type ExchangeId = u32;
pub type IndustryId = u32;
pub type SectorId = u32;

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerBucket {
    name: String,
    tickers: Vec<TickerBucketTicker>,
    #[serde(rename = "type")]
    bucket_type: String, // Field is renamed because "type" is a reserved keyword in Rust
    description: String,
    is_user_configurable: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerBucketTicker {
    ticker_id: TickerId,
    symbol: String,
    exchange_short_name: Option<String>,
    quantity: f32,
}
