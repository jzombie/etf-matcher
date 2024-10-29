include!("../__AUTOGEN__generated_ticker_vectors_config.rs");

pub fn get_ticker_vector_config_by_key(key: &str) -> Option<TickerVectorConfig> {
    let map: HashMap<&'static str, TickerVectorConfig> = get_ticker_vectors_map();
    map.get(key).cloned()
}
