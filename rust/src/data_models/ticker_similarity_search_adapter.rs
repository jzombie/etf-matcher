use crate::data_models::DataURL;
use crate::types::TickerSymbol;
use crate::utils;
use crate::utils::ticker_utils::get_ticker_symbol_map;
use std::sync::Arc;
use ticker_similarity_search::data_models::{
    TickerEuclideanDistance as TickerEuclideanDistanceIdBased, TickerSymbolMapper,
    TickerVectorRepository, TickerWithWeight as TickerWithWeightIdBased,
};
use wasm_bindgen::JsValue;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct TickerEuclideanDistance {
    pub ticker_symbol: TickerSymbol,
    pub distance: f32,
    pub original_pca_coords: Vec<f32>,
    pub translated_pca_coords: Vec<f32>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct TickerWithWeight {
    pub ticker_symbol: TickerSymbol,
    pub weight: f32,
}

pub struct TickerSimilaritySearchAdapter {
    ticker_vector_repository: Arc<TickerVectorRepository>,
    ticker_symbol_mapper: Arc<TickerSymbolMapper>,
}

impl TickerSimilaritySearchAdapter {
    pub async fn from_ticker_vector_config_key(
        ticker_vector_config_key: &str,
    ) -> Result<Self, JsValue> {
        // Initialize the repository and mapper using Arc
        let ticker_vector_repository =
            Self::init_ticker_vector_repository(ticker_vector_config_key)
                .await
                .map_err(|err| {
                    format!("Failed to initialize ticker vector repository: {:?}", err)
                })?;

        let ticker_symbol_mapper = Arc::new(
            Self::init_ticker_symbol_mapper()
                .await
                .map_err(|err| format!("Failed to initialize ticker symbol mapper: {:?}", err))?,
        );

        let instance = Self {
            ticker_vector_repository,
            ticker_symbol_mapper,
        };

        // TODO: Remove
        web_sys::console::debug_1(&JsValue::from_str(&format!(
            "TickerVectorRepository address: {:p}, Registered vectors count: {}",
            Arc::as_ptr(&instance.ticker_vector_repository),
            instance
                .ticker_vector_repository
                .get_registered_vectors_count()
        )));

        Ok(instance)
    }

    async fn init_ticker_vector_repository(
        ticker_vector_config_key: &str,
    ) -> Result<Arc<TickerVectorRepository>, JsValue> {
        // Check the alias cache for an existing instance
        if let Ok(cached_ticker_vector_repository) =
            TickerVectorRepository::from_alias(ticker_vector_config_key)
        {
            return Ok(cached_ticker_vector_repository);
        }

        let url = DataURL::TickerVectors(ticker_vector_config_key.to_string()).value();

        // TODO: This may not need to be cached via this mechanism since the byte array is stored separately
        // (ideally it should still maintain in the reporting that it is indeed still cached)
        let file_content = utils::xhr_fetch_cached(url.to_string())
            .await
            .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

        let ticker_vector_repository = TickerVectorRepository::from_flatbuffers_byte_array(
            file_content.as_slice(),
            ticker_vector_config_key,
        )?;

        // TODO: Remove
        web_sys::console::debug_1(&JsValue::from_str(&format!(
            "Address: {:p}, Registered vectors count: {:?}, instance hash: {}",
            Arc::as_ptr(&ticker_vector_repository),
            ticker_vector_repository.get_registered_vectors_count(),
            ticker_vector_repository.instance_hash
        )));

        Ok(ticker_vector_repository)
    }

    async fn init_ticker_symbol_mapper() -> Result<TickerSymbolMapper, JsValue> {
        let ticker_symbol_map = get_ticker_symbol_map().await?;

        let ticker_symbol_mapper = TickerSymbolMapper::from_ticker_symbol_map(ticker_symbol_map);

        Ok(ticker_symbol_mapper)
    }

    pub fn audit_missing_ticker_vectors(
        &self,
        ticker_symbols: &[TickerSymbol],
    ) -> Result<Vec<TickerSymbol>, JsValue> {
        let ticker_vector_repository = Arc::clone(&self.ticker_vector_repository);
        let ticker_symbol_mapper = Arc::clone(&self.ticker_symbol_mapper);

        // TODO: Remove
        web_sys::console::debug_1(&JsValue::from_str(&format!(
            "Registered vectors count [audit_missing_ticker_vectors]: {:?}",
            ticker_vector_repository.get_registered_vectors_count()
        )));

        let ticker_ids = ticker_symbol_mapper.get_ticker_ids(ticker_symbols);

        let missing_ticker_ids =
            ticker_vector_repository.audit_missing_tickers(ticker_ids.as_slice())?;

        let missing_ticker_symbols = ticker_symbol_mapper.get_ticker_symbols(&missing_ticker_ids);

        Ok(missing_ticker_symbols)
    }

    fn euclidean_results_id_based_to_symbol_based(
        &self,
        euclidean_results_id_based: &Vec<TickerEuclideanDistanceIdBased>,
    ) -> Vec<TickerEuclideanDistance> {
        let ticker_symbol_mapper = Arc::clone(&self.ticker_symbol_mapper);

        euclidean_results_id_based
            .iter()
            .map(|result| TickerEuclideanDistance {
                ticker_symbol: ticker_symbol_mapper
                    .get_ticker_symbol(result.ticker_id)
                    // TODO: Don't use unwrap
                    .unwrap(),
                distance: result.distance,
                original_pca_coords: result.original_pca_coords.clone(),
                translated_pca_coords: result.translated_pca_coords.clone(),
            })
            .collect()
    }

    pub fn get_euclidean_by_ticker(
        &self,
        ticker_symbol: &TickerSymbol,
    ) -> Result<Vec<TickerEuclideanDistance>, JsValue> {
        let ticker_vector_repository = Arc::clone(&self.ticker_vector_repository);
        let ticker_symbol_mapper = Arc::clone(&self.ticker_symbol_mapper);

        // TODO: Remove
        web_sys::console::debug_1(&JsValue::from_str(&format!(
            "TickerVectorRepository address: {:p}, Registered vectors count: {}",
            Arc::as_ptr(&self.ticker_vector_repository),
            self.ticker_vector_repository.get_registered_vectors_count()
        )));

        // TODO: Remove
        web_sys::console::debug_1(&JsValue::from_str(&format!(
            "Registered vectors count [get_euclidean_by_ticker]: {:?}",
            ticker_vector_repository.get_registered_vectors_count()
        )));

        let ticker_id = ticker_symbol_mapper
            .get_ticker_id(ticker_symbol.to_string())
            // TODO: Don't use unwrap
            .unwrap();

        let euclidean_results_id_based: Vec<TickerEuclideanDistanceIdBased> =
            TickerEuclideanDistanceIdBased::get_euclidean_by_ticker(
                &ticker_vector_repository,
                ticker_id,
            )?;

        let euclidean_results =
            self.euclidean_results_id_based_to_symbol_based(&euclidean_results_id_based);

        Ok(euclidean_results)
    }

    pub fn get_euclidean_by_ticker_bucket(
        &self,
        tickers_with_weight: &[TickerWithWeight],
    ) -> Result<Vec<TickerEuclideanDistance>, JsValue> {
        let ticker_vector_repository = Arc::clone(&self.ticker_vector_repository);
        let ticker_symbol_mapper = Arc::clone(&self.ticker_symbol_mapper);

        let tickers_with_weight_id_based: Vec<TickerWithWeightIdBased> = tickers_with_weight
            .iter()
            .map(|ticker_with_weight| TickerWithWeightIdBased {
                ticker_id: ticker_symbol_mapper
                    .get_ticker_id(ticker_with_weight.ticker_symbol.to_string())
                    // TODO: Don't use unwrap
                    .unwrap(),
                weight: ticker_with_weight.weight,
            })
            .collect();

        let euclidean_results_id_based: Vec<TickerEuclideanDistanceIdBased> =
            TickerEuclideanDistanceIdBased::get_euclidean_by_ticker_bucket(
                &ticker_vector_repository,
                &tickers_with_weight_id_based,
            )?;

        let euclidean_results =
            self.euclidean_results_id_based_to_symbol_based(&euclidean_results_id_based);

        Ok(euclidean_results)
    }
}
