use serde::{Deserialize, Deserializer, Serialize};
use crate::JsValue;
use crate::utils::shard::query_shard_for_symbol;
use crate::data_models::DataURL;

// Custom deserialization function to convert Option<i32> to Option<bool>
fn from_numeric_to_option_bool<'de, D>(deserializer: D) -> Result<Option<bool>, D::Error>
where
    D: Deserializer<'de>,
{
    let num: Option<i32> = Option::deserialize(deserializer)?;
    Ok(num.map(|n| n != 0))
}

// "Level 2"?
#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolDetail {
    pub symbol: String,
    pub company_name: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub industry: Option<String>,
    pub sector: Option<String>,
    #[serde(deserialize_with = "from_numeric_to_option_bool")]
    pub is_etf: Option<bool>,
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
