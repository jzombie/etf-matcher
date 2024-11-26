use serde::{Deserialize, Serialize};

// Note: This struct is placed here because it is used inside `build.rs` as well
// as during runtime.
#[derive(Clone, Serialize, Deserialize)]
pub struct TickerVectorConfig {
    pub key: &'static str,
    pub sort_order: u32,
    pub path: &'static str,
    pub description: Option<&'static str>,
    pub last_training_time: &'static str, // Note: Ideally, this should be a `DateTime`
    pub vector_dimensions: u32,
    pub training_sequence_length: u32,
    pub training_data_sources: Vec<&'static str>,
}
