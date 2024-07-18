pub enum DataURL {
    DataBuildInfo,
    SymbolByIdIndex,
    SymbolSearch,
    SymbolDetailShardIndex,
    SymbolETFHoldersShardIndex,
    ETFAggregateDetailShardIndex,
    Image(String),
}

impl DataURL {
    pub fn value(&self) -> &'static str {
        match self {
            DataURL::DataBuildInfo => "/data/data_build_info.enc",
            DataURL::SymbolByIdIndex => "/data/symbol_by_id_index.enc",
            DataURL::SymbolSearch => "/data/symbol_search_dict.enc",
            DataURL::SymbolDetailShardIndex => "/data/symbol_detail_shard_index.enc",
            DataURL::SymbolETFHoldersShardIndex => "/data/symbol_etf_holders_shard_index.enc",
            DataURL::ETFAggregateDetailShardIndex => "/data/etf_aggregate_detail_shard_index.enc",
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
