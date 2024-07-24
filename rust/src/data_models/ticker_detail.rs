use crate::data_models::DataURL;
use crate::utils::logo_utils::extract_logo_filename;
use crate::utils::shard::query_shard_for_value;
use crate::JsValue;
use crate::types::TickerId;
use serde::{Deserialize, Deserializer, Serialize};

// Custom deserialization function to convert Option<i32> to Option<bool>
fn from_numeric_to_option_bool<'de, D>(deserializer: D) -> Result<Option<bool>, D::Error>
where
    D: Deserializer<'de>,
{
    let num: Option<i32> = Option::deserialize(deserializer)?;
    Ok(num.map(|n| n != 0))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerDetail {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub company_name: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub industry_name: Option<String>,
    pub sector_name: Option<String>,
    #[serde(deserialize_with = "from_numeric_to_option_bool")]
    pub is_etf: Option<bool>,
    pub score_avg_dca: Option<f32>,
    pub logo_filename: Option<String>,
}

impl TickerDetail {
    pub async fn get_ticker_detail(ticker_id: TickerId) -> Result<TickerDetail, JsValue> {
        let url: &str = DataURL::TickerDetailShardIndex.value();
        let mut detail: TickerDetail = query_shard_for_value(
            url,
            &ticker_id,
            |detail: &TickerDetail| Some(&detail.ticker_id),
        )
        .await?
        .ok_or_else(|| JsValue::from_str("Symbol not found"))?;

        // Extract the logo filename
        detail.logo_filename =
            extract_logo_filename(detail.logo_filename.as_deref(), &detail.symbol);

        Ok(detail)
    }
}
