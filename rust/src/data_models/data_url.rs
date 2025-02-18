use crate::data_models::TickerSimilaritySearchAdapter;
use std::path::PathBuf;

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

// In relation to the web root
const DATA_BASE_PATH: &str = "/data";

impl DataURL {
    pub fn value(&self) -> String {
        match self {
            DataURL::DataBuildInfo => Self::build_path("data_build_info.enc"),
            // DataURL::TickerByIdIndex => Self::build_path("ticker_by_id_index.enc"),
            DataURL::ExchangeByIdIndex => Self::build_path("exchange_by_id_index.enc"),
            DataURL::SectorByIdIndex => Self::build_path("sector_by_id_index.enc"),
            DataURL::IndustryByIdIndex => Self::build_path("industry_by_id_index.enc"),
            DataURL::TickerSearch => Self::build_path("ticker_search_dict.enc"),
            DataURL::TickerDetailShardIndex => Self::build_path("ticker_detail_shard_index.enc"),
            DataURL::Ticker10KDetailShardIndex => {
                Self::build_path("ticker_10k_detail_shard_index.enc")
            }
            DataURL::TickerETFHoldersShardIndex => {
                Self::build_path("ticker_etf_holders_shard_index.enc")
            }
            DataURL::ETFAggregateDetailShardIndex => {
                Self::build_path("etf_aggregate_detail_shard_index.enc")
            }
            DataURL::ETFHoldingTickersShardIndex => {
                Self::build_path("etf_holding_tickers_shard_index.enc")
            }
            DataURL::TickerVectors(ticker_vector_config_key) => {
                TickerSimilaritySearchAdapter::get_ticker_vector_config_by_key(
                    ticker_vector_config_key,
                )
                .map(|ticker_vector_config| Self::build_path(&ticker_vector_config.path))
                .ok_or_else(|| {
                    format!(
                        "Key not found in ticker vectors map: {}",
                        ticker_vector_config_key
                    )
                })
                .expect(&format!(
                    "Invalid ticker vector key: {}",
                    ticker_vector_config_key
                )) // Or propagate the error up
            }
            DataURL::Image(_) => panic!("Use image_url() for image paths"), // Prevent calling value() for images
        }
    }

    fn build_path(file_name: &str) -> String {
        let full_path = PathBuf::from(DATA_BASE_PATH).join(file_name);
        full_path.to_string_lossy().into_owned()
    }

    // Function to get full URL for images
    pub fn image_url(&self) -> String {
        match self {
            DataURL::Image(filename) => Self::build_path(&format!("images/{}", filename)),
            // TODO: Don't panic!
            _ => panic!("Not an image URL"),
        }
    }
}
