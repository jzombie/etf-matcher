use serde::{Deserialize, Serialize};

/// Note: This struct is placed here because it is used inside `build.rs` as well
/// as during runtime.
#[derive(Clone, Serialize, Deserialize)]
pub struct TickerVectorConfig {
    pub key: &'static str,
    pub path: &'static str,
    pub description: Option<&'static str>,
    pub last_training_time: &'static str,
    pub vector_dimensions: u32,
    pub training_sequence_length: u32,
    pub training_data_sources: Vec<&'static str>,
}
