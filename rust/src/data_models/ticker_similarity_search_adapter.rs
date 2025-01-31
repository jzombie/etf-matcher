use crate::data_models::DataURL;
use crate::types::TickerSymbol;
use crate::utils;
use crate::utils::ticker_utils::get_ticker_symbol_map;
use std::sync::Arc;
use ticker_similarity_search::data_models::{
    TickerCosineSimilarity as LibTickerCosineSimilarity,
    TickerEuclideanDistance as LibTickerEuclideanDistance, TickerSymbolMapper,
    TickerVectorRepository, TickerWithWeight as LibTickerWithWeight,
};
use wasm_bindgen::JsValue;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Coord2D {
    x: f32,
    y: f32,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct TickerEuclideanDistance {
    pub ticker_symbol: TickerSymbol,
    pub distance: f32,
    pub original_pca_coords: Coord2D,
    pub centered_pca_coords: Coord2D,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct TickerWithWeight {
    pub ticker_symbol: TickerSymbol,
    pub weight: f32,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct TickerCosineSimilarity {
    pub ticker_symbol: TickerSymbol,
    pub similarity_score: f32,
}

pub struct TickerSimilaritySearchAdapter {
    ticker_vector_repository: Arc<TickerVectorRepository>,
    ticker_symbol_mapper: Arc<TickerSymbolMapper>,
}

// TODO: Make this configurable
static MAX_RESULTS: usize = 50;

/// Compatibility layer for `ticker-similarity-search` crate
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
        self.ticker_vector_repository
            .audit_missing_ticker_vectors_by_symbol(&self.ticker_symbol_mapper, &ticker_symbols)
            .map_err(|err| {
                JsValue::from_str(&format!("audit_missing_ticker_vectors Error: {:?}", err))
            })
    }

    pub fn get_euclidean_by_ticker(
        &self,
        ticker_symbol: &TickerSymbol,
    ) -> Result<Vec<TickerEuclideanDistance>, JsValue> {
        LibTickerEuclideanDistance::get_euclidean_by_ticker(
            &self.ticker_vector_repository,
            &self.ticker_symbol_mapper,
            ticker_symbol.to_string(),
            MAX_RESULTS,
        )
        .map(|results| {
            results
                .into_iter()
                .map(|result| TickerEuclideanDistance {
                    ticker_symbol: result.ticker_symbol,
                    distance: result.distance,
                    original_pca_coords: Coord2D {
                        x: result.original_pca_coords.x,
                        y: result.original_pca_coords.y,
                    },
                    centered_pca_coords: Coord2D {
                        x: result.centered_pca_coords.x,
                        y: result.centered_pca_coords.y,
                    },
                })
                .collect()
        })
        .map_err(|err| JsValue::from_str(&format!("get_euclidean_by_ticker Error: {:?}", err)))
    }

    pub fn get_euclidean_by_ticker_bucket(
        &self,
        tickers_with_weight: &[TickerWithWeight],
    ) -> Result<Vec<TickerEuclideanDistance>, JsValue> {
        LibTickerEuclideanDistance::get_euclidean_by_ticker_bucket(
            &self.ticker_vector_repository,
            &self.ticker_symbol_mapper,
            &self.to_lib_tickers_with_weight(tickers_with_weight),
            MAX_RESULTS,
        )
        .map(|results| {
            results
                .into_iter()
                .map(|result| TickerEuclideanDistance {
                    ticker_symbol: result.ticker_symbol,
                    distance: result.distance,
                    original_pca_coords: Coord2D {
                        x: result.original_pca_coords.x,
                        y: result.original_pca_coords.y,
                    },
                    centered_pca_coords: Coord2D {
                        x: result.centered_pca_coords.x,
                        y: result.centered_pca_coords.y,
                    },
                })
                .collect()
        })
        .map_err(|err| {
            JsValue::from_str(&format!("get_euclidean_by_ticker_bucket Error: {:?}", err))
        })
    }

    pub fn get_cosine_by_ticker(
        &self,
        ticker_symbol: TickerSymbol,
    ) -> Result<Vec<TickerCosineSimilarity>, JsValue> {
        LibTickerCosineSimilarity::get_cosine_by_ticker(
            &self.ticker_vector_repository,
            &self.ticker_symbol_mapper,
            ticker_symbol.to_string(),
            MAX_RESULTS,
        )
        .map(|results| {
            results
                .into_iter()
                .map(|result| TickerCosineSimilarity {
                    ticker_symbol: result.ticker_symbol,
                    similarity_score: result.similarity_score,
                })
                .collect()
        })
        .map_err(|err| JsValue::from_str(&format!("get_cosine_by_ticker Error: {:?}", err)))
    }

    pub fn get_cosine_by_ticker_bucket(
        &self,
        tickers_with_weight: &[TickerWithWeight],
    ) -> Result<Vec<TickerCosineSimilarity>, JsValue> {
        LibTickerCosineSimilarity::get_cosine_by_ticker_bucket(
            &self.ticker_vector_repository,
            &self.ticker_symbol_mapper,
            &self.to_lib_tickers_with_weight(tickers_with_weight),
            MAX_RESULTS,
        )
        .map(|results| {
            results
                .into_iter()
                .map(|result| TickerCosineSimilarity {
                    ticker_symbol: result.ticker_symbol,
                    similarity_score: result.similarity_score,
                })
                .collect()
        })
        .map_err(|err| JsValue::from_str(&format!("get_cosine_by_ticker_bucket Error: {:?}", err)))
    }

    /// Converts local `[TickerWithWeight]` into struct defined by similarity search library
    fn to_lib_tickers_with_weight(
        &self,
        tickers_with_weight: &[TickerWithWeight],
    ) -> Vec<LibTickerWithWeight> {
        tickers_with_weight
            .iter()
            .map(|ticker| LibTickerWithWeight {
                ticker_symbol: ticker.ticker_symbol.clone(),
                weight: ticker.weight,
            })
            .collect()
    }
}
