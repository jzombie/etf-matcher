// Include the generated configuration file
include!("../__AUTOGEN__generated_config.rs");

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
    TickerVectors(String),
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
                let map = get_ticker_vectors_map();
                let ticker_vector = map
                    .get(key.as_str())
                    .expect(&format!("Key not found in ticker vectors map: {}", key));

                // Concatenate the static prefix with the path
                const PREFIX: &str = "/data/";

                let url = format!("{}{}", PREFIX, ticker_vector.path);

                web_sys::console::log_1(&url.to_string().into());

                url // Return the String directly
            }
            DataURL::Image(_) => panic!("Use image_url() for image paths"), // Prevent calling value() for images
        }
    }

    // pub fn value(&self) -> &'static str {
    //     match self {
    //         DataURL::DataBuildInfo => "/data/data_build_info.enc",
    //         // DataURL::TickerByIdIndex => "/data/ticker_by_id_index.enc",
    //         DataURL::ExchangeByIdIndex => "/data/exchange_by_id_index.enc",
    //         DataURL::SectorByIdIndex => "/data/sector_by_id_index.enc",
    //         DataURL::IndustryByIdIndex => "/data/industry_by_id_index.enc",
    //         DataURL::TickerSearch => "/data/ticker_search_dict.enc",
    //         DataURL::TickerDetailShardIndex => "/data/ticker_detail_shard_index.enc",
    //         DataURL::Ticker10KDetailShardIndex => "/data/ticker_10k_detail_shard_index.enc",
    //         DataURL::TickerETFHoldersShardIndex => "/data/ticker_etf_holders_shard_index.enc",
    //         DataURL::ETFAggregateDetailShardIndex => "/data/etf_aggregate_detail_shard_index.enc",
    //         DataURL::ETFHoldingTickersShardIndex => "/data/etf_holding_tickers_shard_index.enc",
    //         // TODO: Replace this usage with `TickerVectors` directly
    //         //
    //         //
    //         // 10-K
    //         // DataURL::FinancialVectors10K => "/data/financial_vectors.tenk.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
    //         // DataURL::FinancialVectors10K => "/data/r2.financial_vectors.tenk.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
    //         // DataURL::FinancialVectors10K => "/data/r4.financial_vectors.tenk.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
    //         // DataURL::FinancialVectors10K => "/data/r4a.financial_vectors.tenq.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
    //         //
    //         // 10-Q
    //         // DataURL::FinancialVectors10K => "/data/r5-5-10-20yr.financial_vectors.tenq.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
    //         // DataURL::FinancialVectors10K => "/data/r5-5-10-20yr(rev-2).financial_vectors.tenq.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
    //         //
    //         // DataURL::FinancialVectors10K => "/data/key_metrics.tenk.bin", // Prototype
    //         //
    //         DataURL::TickerVectors(key) => {
    //             // Use the generated HashMap to dynamically retrieve the TickerVector
    //             let map = get_ticker_vectors_map();
    //             let ticker_vector = map
    //                 .get(key.as_str())
    //                 .expect("Key not found in ticker vectors map");

    //             // Concatenate the static prefix with the path
    //             const PREFIX: &str = "/data/";

    //             let url = format!("{}{}", PREFIX, ticker_vector.path);

    //             web_sys::console::log_1(&url.to_string().into());

    //             url
    //         }
    //         DataURL::Image(_) => panic!("Use image_url() for image paths"), // Prevent calling value() for images
    //     }
    // }

    // Function to get full URL for images
    pub fn image_url(&self) -> String {
        match self {
            DataURL::Image(filename) => format!("/data/images/{}", filename),
            _ => panic!("Not an image URL"),
        }
    }
}
