use crate::data_models::DataURL;
use crate::types::TickerId;
use crate::utils::shard::query_shard_for_id;
use crate::JsValue;
use serde::{Deserialize, Deserializer, Serialize};

// TODO: Move to a utility (also search for `from_numeric_to_bool`)
fn deserialize_is_current<'de, D>(deserializer: D) -> Result<Option<bool>, D::Error>
where
    D: Deserializer<'de>,
{
    let value: Option<i32> = Option::deserialize(deserializer)?;
    Ok(match value {
        Some(1) => Some(true),
        Some(0) => Some(false),
        _ => None,
    })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Ticker10KDetail {
    pub ticker_id: TickerId,
    pub calendar_year: Option<u32>,
    pub revenue_current: Option<f64>,
    pub gross_profit_current: Option<f64>,
    pub operating_income_current: Option<f64>,
    pub net_income_current: Option<f64>,
    pub revenue_1_year_ago: Option<f64>,
    pub gross_profit_1_year_ago: Option<f64>,
    pub operating_income_1_year_ago: Option<f64>,
    pub net_income_1_year_ago: Option<f64>,
    pub revenue_2_years_ago: Option<f64>,
    pub gross_profit_2_years_ago: Option<f64>,
    pub operating_income_2_years_ago: Option<f64>,
    pub net_income_2_years_ago: Option<f64>,
    pub revenue_3_years_ago: Option<f64>,
    pub gross_profit_3_years_ago: Option<f64>,
    pub operating_income_3_years_ago: Option<f64>,
    pub net_income_3_years_ago: Option<f64>,
    pub revenue_4_years_ago: Option<f64>,
    pub gross_profit_4_years_ago: Option<f64>,
    pub operating_income_4_years_ago: Option<f64>,
    pub net_income_4_years_ago: Option<f64>,
    pub total_assets_current: Option<f64>,
    pub total_liabilities_current: Option<f64>,
    pub total_stockholders_equity_current: Option<f64>,
    pub total_assets_1_year_ago: Option<f64>,
    pub total_liabilities_1_year_ago: Option<f64>,
    pub total_stockholders_equity_1_year_ago: Option<f64>,
    pub total_assets_2_years_ago: Option<f64>,
    pub total_liabilities_2_years_ago: Option<f64>,
    pub total_stockholders_equity_2_years_ago: Option<f64>,
    pub total_assets_3_years_ago: Option<f64>,
    pub total_liabilities_3_years_ago: Option<f64>,
    pub total_stockholders_equity_3_years_ago: Option<f64>,
    pub total_assets_4_years_ago: Option<f64>,
    pub total_liabilities_4_years_ago: Option<f64>,
    pub total_stockholders_equity_4_years_ago: Option<f64>,
    pub operating_cash_flow_current: Option<f64>,
    pub net_cash_provided_by_operating_activities_current: Option<f64>,
    pub net_cash_used_for_investing_activities_current: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_current: Option<f64>,
    pub operating_cash_flow_1_year_ago: Option<f64>,
    pub net_cash_provided_by_operating_activities_1_year_ago: Option<f64>,
    pub net_cash_used_for_investing_activities_1_year_ago: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_1_year_ago: Option<f64>,
    pub operating_cash_flow_2_years_ago: Option<f64>,
    pub net_cash_provided_by_operating_activities_2_years_ago: Option<f64>,
    pub net_cash_used_for_investing_activities_2_years_ago: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_2_years_ago: Option<f64>,
    pub operating_cash_flow_3_years_ago: Option<f64>,
    pub net_cash_provided_by_operating_activities_3_years_ago: Option<f64>,
    pub net_cash_used_for_investing_activities_3_years_ago: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_3_years_ago: Option<f64>,
    pub operating_cash_flow_4_years_ago: Option<f64>,
    pub net_cash_provided_by_operating_activities_4_years_ago: Option<f64>,
    pub net_cash_used_for_investing_activities_4_years_ago: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_4_years_ago: Option<f64>,
    #[serde(deserialize_with = "deserialize_is_current")]
    pub is_current: Option<bool>,
}

impl Ticker10KDetail {
    pub async fn get_ticker_10k_detail_by_ticker_id(
        ticker_id: TickerId,
    ) -> Result<Ticker10KDetail, JsValue> {
        let url: &str = DataURL::Ticker10KDetailShardIndex.value();
        let ticker_10k_detail: Ticker10KDetail =
            query_shard_for_id(url, &ticker_id, |ticker_10k_detail: &Ticker10KDetail| {
                Some(&ticker_10k_detail.ticker_id)
            })
            .await?
            .ok_or_else(|| JsValue::from_str("Ticker ID not found"))?;

        Ok(ticker_10k_detail)
    }
}
