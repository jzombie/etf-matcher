use crate::data_models::{DataURL, PaginatedResults};
use crate::utils::shard::query_shard_for_symbol;
use crate::JsValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolETFHolder {
    pub symbol: String,
    pub etf_symbols_json: String,
}

impl SymbolETFHolder {
    pub async fn get_symbol_etf_holders(
        symbol: &str,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<String>, JsValue> {
        let url: &str = DataURL::SymbolETFHoldersShardIndex.value();
        let holder =
            query_shard_for_symbol(url, symbol, |detail: &SymbolETFHolder| Some(&detail.symbol))
                .await?
                .ok_or_else(|| JsValue::from_str("Symbol not found"))?;

        let etf_symbols: Vec<String> = serde_json::from_str(&holder.etf_symbols_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse etf_symbols: {}", e)))?;

        PaginatedResults::paginate(etf_symbols, page, page_size)
    }
}
