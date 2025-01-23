use serde::{Deserialize, Serialize};

pub type TickerId = u32;
pub type TickerSymbol = String;
pub type ExchangeId = u32;
pub type IndustryId = u32;
pub type SectorId = u32;

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerWeightedSectorDistribution {
    pub major_sector_name: String,
    pub weight: f64,
}
