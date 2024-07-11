use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::utils::shard::query_shard_for_symbol;
use crate::data_models::DataURL;


// "Level 2"?
#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolDetail {
    pub symbol: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub industry: Option<String>,
    pub sector: Option<String>,
}

impl SymbolDetail {
    pub async fn get_symbol_detail(symbol: &str) -> Result<SymbolDetail, JsValue> {
        let url: &str = DataURL::SymbolDetailShardIndex.value();
        query_shard_for_symbol(url, symbol, |detail: &SymbolDetail| {
            Some(&detail.symbol)
        })
        .await?
        .ok_or_else(|| JsValue::from_str("Symbol not found"))
    }
}
