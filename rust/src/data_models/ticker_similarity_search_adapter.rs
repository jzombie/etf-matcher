use crate::data_models::DataURL;
use crate::utils;
use crate::utils::ticker_utils::get_ticker_symbol_map;
use std::rc::Rc;
use ticker_similarity_search::data_models::{
    flatbuffers_ticker_vectors_collection::TickerVector, ticker_symbol_mapper, TickerSymbolMapper,
    TickerVectorRepository,
};
use wasm_bindgen::JsValue;

pub struct TickerSimilaritySearchAdapter {
    ticker_vector_repository: Rc<TickerVectorRepository>,
    ticker_symbol_mapper: Rc<TickerSymbolMapper>,
}

// TODO: Be wary about using Rc or Arc and inadvertently winding up with cyclic loops that can never be freed
impl TickerSimilaritySearchAdapter {
    pub async fn from_ticker_vector_config_key(
        ticker_vector_config_key: &str,
    ) -> Result<Self, JsValue> {
        // Initialize the repository and mapper using Rc
        let ticker_vector_repository = Rc::new(
            Self::init_ticker_vector_repository(ticker_vector_config_key)
                .await
                .map_err(|err| {
                    format!("Failed to initialize ticker vector repository: {:?}", err)
                })?,
        );

        let ticker_symbol_mapper = Rc::new(
            Self::init_ticker_symbol_mapper()
                .await
                .map_err(|err| format!("Failed to initialize ticker symbol mapper: {:?}", err))?,
        );

        Ok(Self {
            ticker_vector_repository,
            ticker_symbol_mapper,
        })
    }

    async fn init_ticker_vector_repository(
        ticker_vector_config_key: &str,
    ) -> Result<TickerVectorRepository, JsValue> {
        let url = DataURL::TickerVectors(ticker_vector_config_key.to_string()).value();

        let file_content = utils::xhr_fetch_cached(url.to_string())
            .await
            .map_err(|err| format!("Failed to fetch file: {:?}", err))?;

        let ticker_vector_repository =
            TickerVectorRepository::from_flatbuffers_byte_array(file_content.as_slice())?;

        Ok(ticker_vector_repository)
    }

    async fn init_ticker_symbol_mapper() -> Result<TickerSymbolMapper, JsValue> {
        let ticker_symbol_map = get_ticker_symbol_map().await?;

        let ticker_symbol_mapper = TickerSymbolMapper::from_ticker_symbol_map(ticker_symbol_map);

        Ok(ticker_symbol_mapper)
    }
}
