use crate::utils::ticker_vector_config_utils::get_ticker_vector_config_by_key;

pub enum DataURL {
    DataBuildInfo,
    // TickerByIdIndex,
    ExchangeByIdIndex,
    SectorByIdIndex,
    IndustryByIdIndex,
    TickerSearch,
    TickerDetailShardIndex,
    Ticker10KDetailShardIndex,
    TickerETFHoldersShardIndex,
    ETFAggregateDetailShardIndex,
    ETFHoldingTickersShardIndex,
    TickerVectors(String), // Made plural because this is a `FlatBuffer` file of multiple vectors
    Image(String),
}

impl DataURL {
    pub fn value(&self) -> String {
        match self {
            DataURL::DataBuildInfo => "/data/data_build_info.enc".to_string(),
            // DataURL::TickerByIdIndex => "/data/ticker_by_id_index.enc".to_string(),
            DataURL::ExchangeByIdIndex => "/data/exchange_by_id_index.enc".to_string(),
            DataURL::SectorByIdIndex => "/data/sector_by_id_index.enc".to_string(),
            DataURL::IndustryByIdIndex => "/data/industry_by_id_index.enc".to_string(),
            DataURL::TickerSearch => "/data/ticker_search_dict.enc".to_string(),
            DataURL::TickerDetailShardIndex => "/data/ticker_detail_shard_index.enc".to_string(),
            DataURL::Ticker10KDetailShardIndex => {
                "/data/ticker_10k_detail_shard_index.enc".to_string()
            }
            DataURL::TickerETFHoldersShardIndex => {
                "/data/ticker_etf_holders_shard_index.enc".to_string()
            }
            DataURL::ETFAggregateDetailShardIndex => {
                "/data/etf_aggregate_detail_shard_index.enc".to_string()
            }
            DataURL::ETFHoldingTickersShardIndex => {
                "/data/etf_holding_tickers_shard_index.enc".to_string()
            }
            DataURL::TickerVectors(key) => {
                // Use the generated HashMap to dynamically retrieve the TickerVector
                let ticker_vector_config = get_ticker_vector_config_by_key(key)
                    .expect(&format!("Key not found in ticker vectors map: {}", key));

                // Concatenate the static prefix with the path
                const PREFIX: &str = "/data/";

                let url = format!("{}{}", PREFIX, ticker_vector_config.path);

                url
            }
            DataURL::Image(_) => panic!("Use image_url() for image paths"), // Prevent calling value() for images
        }
    }

    // Function to get full URL for images
    pub fn image_url(&self) -> String {
        match self {
            DataURL::Image(filename) => format!("/data/images/{}", filename),
            _ => panic!("Not an image URL"),
        }
    }
}
