use crate::types::{TickerId, TickerSymbol};
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils::get_ticker_id;
use crate::DataURL;
use crate::JsValue;
use serde::{Deserialize, Deserializer, Serialize};
use std::default::Default;

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

macro_rules! accumulate_fields {
    ($accumulated:expr, $detail:expr, $weight:expr, { $($field:ident),* }) => {
        $(
            $accumulated.$field = Some(
                $accumulated.$field.unwrap_or(0.0) + $detail.$field.unwrap_or(0.0) * $weight
            );
        )*
    };
}

macro_rules! finalize_accumulated_fields {
    ($accumulated:expr, $total_weight:expr, { $($field:ident),* }) => {
        if $total_weight > 0.0 {
            $(
                $accumulated.$field = $accumulated.$field.map(|total| total / $total_weight);
            )*
        }
    };
}

// TODO: Very important, add cash growth metric, and more metrics in general
#[derive(Serialize, Deserialize, Debug, Default)]
pub struct Ticker10KDetail {
    pub ticker_id: TickerId,
    //
    #[serde(deserialize_with = "deserialize_is_current")]
    pub is_current: Option<bool>,
    //
    pub calendar_year_current: Option<u32>,
    pub calendar_year_1_yr: Option<u32>,
    pub calendar_year_2_yr: Option<u32>,
    pub calendar_year_3_yr: Option<u32>,
    pub calendar_year_4_yr: Option<u32>,

    pub revenue_current: Option<f64>,
    pub revenue_1_yr: Option<f64>,
    pub revenue_2_yr: Option<f64>,
    pub revenue_3_yr: Option<f64>,
    pub revenue_4_yr: Option<f64>,
    //
    pub gross_profit_current: Option<f64>,
    pub gross_profit_1_yr: Option<f64>,
    pub gross_profit_2_yr: Option<f64>,
    pub gross_profit_3_yr: Option<f64>,
    pub gross_profit_4_yr: Option<f64>,
    //
    pub operating_income_current: Option<f64>,
    pub operating_income_1_yr: Option<f64>,
    pub operating_income_2_yr: Option<f64>,
    pub operating_income_3_yr: Option<f64>,
    pub operating_income_4_yr: Option<f64>,
    //
    pub net_income_current: Option<f64>,
    pub net_income_1_yr: Option<f64>,
    pub net_income_2_yr: Option<f64>,
    pub net_income_3_yr: Option<f64>,
    pub net_income_4_yr: Option<f64>,
    //
    pub total_assets_current: Option<f64>,
    pub total_assets_1_yr: Option<f64>,
    pub total_assets_2_yr: Option<f64>,
    pub total_assets_3_yr: Option<f64>,
    pub total_assets_4_yr: Option<f64>,
    //
    pub total_liabilities_current: Option<f64>,
    pub total_liabilities_1_yr: Option<f64>,
    pub total_liabilities_2_yr: Option<f64>,
    pub total_liabilities_3_yr: Option<f64>,
    pub total_liabilities_4_yr: Option<f64>,
    //
    pub total_stockholders_equity_current: Option<f64>,
    pub total_stockholders_equity_1_yr: Option<f64>,
    pub total_stockholders_equity_2_yr: Option<f64>,
    pub total_stockholders_equity_3_yr: Option<f64>,
    pub total_stockholders_equity_4_yr: Option<f64>,
    //
    pub operating_cash_flow_current: Option<f64>,
    pub operating_cash_flow_1_yr: Option<f64>,
    pub operating_cash_flow_2_yr: Option<f64>,
    pub operating_cash_flow_3_yr: Option<f64>,
    pub operating_cash_flow_4_yr: Option<f64>,
    //
    pub net_cash_provided_by_operating_activities_current: Option<f64>,
    pub net_cash_provided_by_operating_activities_1_yr: Option<f64>,
    pub net_cash_provided_by_operating_activities_2_yr: Option<f64>,
    pub net_cash_provided_by_operating_activities_3_yr: Option<f64>,
    pub net_cash_provided_by_operating_activities_4_yr: Option<f64>,
    //
    pub net_cash_used_for_investing_activities_current: Option<f64>,
    pub net_cash_used_for_investing_activities_1_yr: Option<f64>,
    pub net_cash_used_for_investing_activities_2_yr: Option<f64>,
    pub net_cash_used_for_investing_activities_3_yr: Option<f64>,
    pub net_cash_used_for_investing_activities_4_yr: Option<f64>,
    //
    pub net_cash_used_provided_by_financing_activities_current: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_1_yr: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_2_yr: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_3_yr: Option<f64>,
    pub net_cash_used_provided_by_financing_activities_4_yr: Option<f64>,
    //
    // FIXME: This is just a temporary alias for the time being and should be
    // addressed to prevent duplication.
    // It is used to satisfy a common union type with `ETFAggregateDetail`.
    pub are_financials_current: Option<bool>,
}

impl Ticker10KDetail {
    // TODO: In the data source, it should always return the same amount of
    // rows as the search data, regardless if there is `10-K` detail or not.
    pub async fn get_ticker_10k_detail(
        ticker_symbol: TickerSymbol,
    ) -> Result<Ticker10KDetail, JsValue> {
        let url: &str = &DataURL::Ticker10KDetailShardIndex.value();

        let ticker_id = get_ticker_id(ticker_symbol.clone()).await.map_err(|err| {
            JsValue::from_str(&format!(
                "Could not fetch ticker ID for ticker symbol: {} {:?}",
                ticker_symbol, err
            ))
        })?;

        let mut ticker_10k_detail: Ticker10KDetail =
            query_shard_for_id(url, &ticker_id, |ticker_10k_detail: &Ticker10KDetail| {
                Some(&ticker_10k_detail.ticker_id)
            })
            .await?
            .ok_or_else(|| JsValue::from_str(&format!("Ticker ID {} not found", ticker_id)))?;

        ticker_10k_detail.are_financials_current = ticker_10k_detail.is_current;

        Ok(ticker_10k_detail)
    }

    pub async fn get_weighted_ticker_10k_detail(
        ticker_weights: Vec<(TickerSymbol, f64)>,
    ) -> Result<Ticker10KDetail, JsValue> {
        let url: &str = &DataURL::Ticker10KDetailShardIndex.value();
        let mut accumulated_detail = Ticker10KDetail::default();
        let mut total_weight = 0.0;

        for (ticker_symbol, weight) in ticker_weights {
            let ticker_id = get_ticker_id(ticker_symbol.clone())
                .await
                .map_err(|_| JsValue::from_str("Could not locate ticker ID"))?;

            if let Some(detail) =
                query_shard_for_id(url, &ticker_id, |ticker_10k_detail: &Ticker10KDetail| {
                    Some(&ticker_10k_detail.ticker_id)
                })
                .await?
            {
                accumulate_fields!(accumulated_detail, detail, weight, {
                    revenue_current,
                    revenue_1_yr,
                    revenue_2_yr,
                    revenue_3_yr,
                    revenue_4_yr,
                    //
                    gross_profit_current,
                    gross_profit_1_yr,
                    gross_profit_2_yr,
                    gross_profit_3_yr,
                    gross_profit_4_yr,
                    //
                    operating_income_current,
                    operating_income_1_yr,
                    operating_income_2_yr,
                    operating_income_3_yr,
                    operating_income_4_yr,
                    //
                    net_income_current,
                    net_income_1_yr,
                    net_income_2_yr,
                    net_income_3_yr,
                    net_income_4_yr,
                    //
                    total_assets_current,
                    total_assets_1_yr,
                    total_assets_2_yr,
                    total_assets_3_yr,
                    total_assets_4_yr,
                    //
                    total_liabilities_current,
                    total_liabilities_1_yr,
                    total_liabilities_2_yr,
                    total_liabilities_3_yr,
                    total_liabilities_4_yr,
                    //
                    total_stockholders_equity_current,
                    total_stockholders_equity_1_yr,
                    total_stockholders_equity_2_yr,
                    total_stockholders_equity_3_yr,
                    total_stockholders_equity_4_yr,
                    //
                    operating_cash_flow_current,
                    operating_cash_flow_1_yr,
                    operating_cash_flow_2_yr,
                    operating_cash_flow_3_yr,
                    operating_cash_flow_4_yr,
                    //
                    net_cash_provided_by_operating_activities_current,
                    net_cash_provided_by_operating_activities_1_yr,
                    net_cash_provided_by_operating_activities_2_yr,
                    net_cash_provided_by_operating_activities_3_yr,
                    net_cash_provided_by_operating_activities_4_yr,
                    //
                    net_cash_used_for_investing_activities_current,
                    net_cash_used_for_investing_activities_1_yr,
                    net_cash_used_for_investing_activities_2_yr,
                    net_cash_used_for_investing_activities_3_yr,
                    net_cash_used_for_investing_activities_4_yr,
                    //
                    net_cash_used_provided_by_financing_activities_current,
                    net_cash_used_provided_by_financing_activities_1_yr,
                    net_cash_used_provided_by_financing_activities_2_yr,
                    net_cash_used_provided_by_financing_activities_3_yr,
                    net_cash_used_provided_by_financing_activities_4_yr
                });
                total_weight += weight;
            }
        }

        finalize_accumulated_fields!(accumulated_detail, total_weight, {
            revenue_current,
            revenue_1_yr,
            revenue_2_yr,
            revenue_3_yr,
            revenue_4_yr,
            //
            gross_profit_current,
            gross_profit_1_yr,
            gross_profit_2_yr,
            gross_profit_3_yr,
            gross_profit_4_yr,
            //
            operating_income_current,
            operating_income_1_yr,
            operating_income_2_yr,
            operating_income_3_yr,
            operating_income_4_yr,
            //
            net_income_current,
            net_income_1_yr,
            net_income_2_yr,
            net_income_3_yr,
            net_income_4_yr,
            //
            total_assets_current,
            total_assets_1_yr,
            total_assets_2_yr,
            total_assets_3_yr,
            total_assets_4_yr,
            //
            total_liabilities_current,
            total_liabilities_1_yr,
            total_liabilities_2_yr,
            total_liabilities_3_yr,
            total_liabilities_4_yr,
            //
            total_stockholders_equity_current,
            total_stockholders_equity_1_yr,
            total_stockholders_equity_2_yr,
            total_stockholders_equity_3_yr,
            total_stockholders_equity_4_yr,
            //
            operating_cash_flow_current,
            operating_cash_flow_1_yr,
            operating_cash_flow_2_yr,
            operating_cash_flow_3_yr,
            operating_cash_flow_4_yr,
            //
            net_cash_provided_by_operating_activities_current,
            net_cash_provided_by_operating_activities_1_yr,
            net_cash_provided_by_operating_activities_2_yr,
            net_cash_provided_by_operating_activities_3_yr,
            net_cash_provided_by_operating_activities_4_yr,
            //
            net_cash_used_for_investing_activities_current,
            net_cash_used_for_investing_activities_1_yr,
            net_cash_used_for_investing_activities_2_yr,
            net_cash_used_for_investing_activities_3_yr,
            net_cash_used_for_investing_activities_4_yr,
            //
            net_cash_used_provided_by_financing_activities_current,
            net_cash_used_provided_by_financing_activities_1_yr,
            net_cash_used_provided_by_financing_activities_2_yr,
            net_cash_used_provided_by_financing_activities_3_yr,
            net_cash_used_provided_by_financing_activities_4_yr
        });

        Ok(accumulated_detail)
    }
}
