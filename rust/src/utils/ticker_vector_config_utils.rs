include!("../__AUTOGEN__generated_ticker_vectors_config.rs");

pub fn get_ticker_vector_config_by_key(key: &str) -> Option<TickerVectorConfig> {
    let map: IndexMap<&'static str, TickerVectorConfig> = get_ticker_vectors_map();
    map.get(key).cloned()
}

/// Retrieves all ticker vector configurations as a vector.
pub fn get_all_ticker_vector_configs() -> Vec<TickerVectorConfig> {
    let map: IndexMap<&'static str, TickerVectorConfig> = get_ticker_vectors_map();
    map.into_iter().map(|(_, config)| config).collect()
}
