pub enum DataURL {
    DataBuildInfo,
    SymbolSearch,
    SymbolDetailShardIndex,
    SymbolETFHoldersShardIndex,
}

impl DataURL {
    pub fn value(&self) -> &'static str {
        match self {
            DataURL::DataBuildInfo => "/data/data_build_info.enc",
            DataURL::SymbolSearch => "/data/symbol_search_dict.enc",
            DataURL::SymbolDetailShardIndex => "/data/symbol_detail_index.enc",
            DataURL::SymbolETFHoldersShardIndex => "/data/symbol_etf_holders_index.enc",
        }
    }
}
