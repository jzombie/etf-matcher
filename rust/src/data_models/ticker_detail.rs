use serde::{Deserialize, Deserializer, Serialize};
use crate::data_models::DataURL;
use crate::JsValue;
use crate::utils::logo_utils::extract_logo_filename;
use crate::utils::shard::query_shard_for_id;
use crate::IndustryById;
use crate::SectorById;
use crate::types::{TickerId, IndustryId, SectorId};

// Custom deserialization function to convert Option<i32> to Option<bool>
fn from_numeric_to_bool<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    let num: i32 = i32::deserialize(deserializer)?;
    Ok(num != 0)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerDetail {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub company_name: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub industry_id: Option<IndustryId>,
    pub sector_id: Option<SectorId>,
    #[serde(deserialize_with = "from_numeric_to_bool")]
    pub is_etf: bool,
    #[serde(deserialize_with = "from_numeric_to_bool")]
    pub is_held_in_etf: bool,
    pub score_avg_dca: Option<f32>,
    pub logo_filename: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerDetailResponse {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub company_name: String,
    pub cik: Option<String>,
    pub country_code: Option<String>,
    pub industry_name: Option<String>,
    pub sector_name: Option<String>,
    pub is_etf: bool,
    pub is_held_in_etf: bool,
    pub score_avg_dca: Option<f32>,
    pub logo_filename: Option<String>,
}

impl TickerDetail {
    pub async fn get_ticker_detail(ticker_id: TickerId) -> Result<TickerDetailResponse, JsValue> {
        let url: &str = DataURL::TickerDetailShardIndex.value();
        let mut detail: TickerDetail = query_shard_for_id(
            url,
            &ticker_id,
            |detail: &TickerDetail| Some(&detail.ticker_id),
        )
        .await?
        .ok_or_else(|| JsValue::from_str("Symbol not found"))?;

        // Extract the logo filename
        detail.logo_filename =
            extract_logo_filename(detail.logo_filename.as_deref(), &detail.symbol);

        // Retrieve industry name if industry_id is present
        let industry_name = match detail.industry_id {
            Some(industry_id) => IndustryById::get_industry_name_with_id(industry_id).await.ok(),
            None => None,
        };

        // Retrieve sector name if sector_id is present
        let sector_name = match detail.sector_id {
            Some(sector_id) => SectorById::get_sector_name_with_id(sector_id).await.ok(),
            None => None,
        };

        // Construct the response
        Ok(TickerDetailResponse {
            ticker_id: detail.ticker_id,
            symbol: detail.symbol,
            exchange_short_name: detail.exchange_short_name,
            company_name: detail.company_name,
            cik: detail.cik,
            country_code: detail.country_code,
            industry_name,
            sector_name,
            is_etf: detail.is_etf,
            is_held_in_etf: detail.is_held_in_etf,
            score_avg_dca: detail.score_avg_dca,
            logo_filename: detail.logo_filename,
        })
    }
}
