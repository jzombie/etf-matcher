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
    FinancialVectors10K,
    Image(String),
}

impl DataURL {
    pub fn value(&self) -> &'static str {
        match self {
            DataURL::DataBuildInfo => "/data/data_build_info.enc",
            // DataURL::TickerByIdIndex => "/data/ticker_by_id_index.enc",
            DataURL::ExchangeByIdIndex => "/data/exchange_by_id_index.enc",
            DataURL::SectorByIdIndex => "/data/sector_by_id_index.enc",
            DataURL::IndustryByIdIndex => "/data/industry_by_id_index.enc",
            DataURL::TickerSearch => "/data/ticker_search_dict.enc",
            DataURL::TickerDetailShardIndex => "/data/ticker_detail_shard_index.enc",
            DataURL::Ticker10KDetailShardIndex => "/data/ticker_10k_detail_shard_index.enc",
            DataURL::TickerETFHoldersShardIndex => "/data/ticker_etf_holders_shard_index.enc",
            DataURL::ETFAggregateDetailShardIndex => "/data/etf_aggregate_detail_shard_index.enc",
            DataURL::ETFHoldingTickersShardIndex => "/data/etf_holding_tickers_shard_index.enc",
            //
            // 10-K
            // DataURL::FinancialVectors10K => "/data/financial_vectors.tenk.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
            // DataURL::FinancialVectors10K => "/data/r2.financial_vectors.tenk.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
            // DataURL::FinancialVectors10K => "/data/r4.financial_vectors.tenk.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
            // DataURL::FinancialVectors10K => "/data/r4a.financial_vectors.tenq.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
            //
            // 10-Q
            // DataURL::FinancialVectors10K => "/data/r5-5-10-20yr.financial_vectors.tenq.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
            DataURL::FinancialVectors10K => "/data/r5-5-10-20yr(rev-2).financial_vectors.tenq.bin", // TODO: Use encoded bin, provided that compression doesn't actually increase the file size
            //
            // DataURL::FinancialVectors10K => "/data/key_metrics.tenk.bin", // Prototype
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
