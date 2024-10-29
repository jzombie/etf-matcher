use config::{Config, File};
use std::sync::Once;

pub struct TickerVectorConfig {
    config: Config,
}

impl TickerVectorConfig {
    fn new() -> Self {
        let config = Config::builder()
            .add_source(File::with_name("ticker_vectors_config.toml"))
            .build()
            .expect("Failed to load financial vector configuration");
        TickerVectorConfig { config }
    }

    pub fn get_path(&self, key: &str) -> String {
        self.config
            .get_string(&format!("financial_vectors.{}", key))
            .unwrap_or_else(|_| panic!("No configuration found for key: {}", key))
    }

    // TODO: Add method to list all available ticker configs (to present them to the user)
}

static INIT: Once = Once::new();
static mut INSTANCE: Option<TickerVectorConfig> = None;

pub fn get_ticker_vector_config() -> &'static TickerVectorConfig {
    unsafe {
        INIT.call_once(|| {
            INSTANCE = Some(TickerVectorConfig::new());
        });
        INSTANCE.as_ref().unwrap()
    }
}
