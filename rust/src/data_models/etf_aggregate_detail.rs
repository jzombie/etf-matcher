use crate::types::{IndustryId, SectorId, TickerId};
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils::get_symbol_and_exchange_by_ticker_id;
use crate::DataURL;
use crate::IndustryById;
use crate::JsValue;
use crate::SectorById;
use serde::{Deserialize, Serialize};

// use web_sys::console;

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetail {
    pub ticker_id: TickerId,
    pub etf_name: Option<String>,
    pub top_market_value_sector_id: Option<SectorId>,
    pub top_market_value_industry_id: Option<IndustryId>,
    pub top_sector_market_value: f64,
    pub currency_code: String,
    pub top_pct_sector_id: Option<SectorId>,
    pub top_pct_industry_id: Option<IndustryId>,
    pub top_pct_sector_weight: f32,
    //
    pub avg_revenue_current: Option<f64>,
    pub avg_gross_profit_current: Option<f64>,
    pub avg_operating_income_current: Option<f64>,
    pub avg_net_income_current: Option<f64>,
    pub avg_revenue_1_year_ago: Option<f64>,
    pub avg_gross_profit_1_year_ago: Option<f64>,
    pub avg_operating_income_1_year_ago: Option<f64>,
    pub avg_net_income_1_year_ago: Option<f64>,
    pub avg_revenue_2_years_ago: Option<f64>,
    pub avg_gross_profit_2_years_ago: Option<f64>,
    pub avg_operating_income_2_years_ago: Option<f64>,
    pub avg_net_income_2_years_ago: Option<f64>,
    pub avg_revenue_3_years_ago: Option<f64>,
    pub avg_gross_profit_3_years_ago: Option<f64>,
    pub avg_operating_income_3_years_ago: Option<f64>,
    pub avg_net_income_3_years_ago: Option<f64>,
    pub avg_revenue_4_years_ago: Option<f64>,
    pub avg_gross_profit_4_years_ago: Option<f64>,
    pub avg_operating_income_4_years_ago: Option<f64>,
    pub avg_net_income_4_years_ago: Option<f64>,
    pub avg_total_assets_current: Option<f64>,
    pub avg_total_liabilities_current: Option<f64>,
    pub avg_total_stockholders_equity_current: Option<f64>,
    pub avg_total_assets_1_year_ago: Option<f64>,
    pub avg_total_liabilities_1_year_ago: Option<f64>,
    pub avg_total_stockholders_equity_1_year_ago: Option<f64>,
    pub avg_total_assets_2_years_ago: Option<f64>,
    pub avg_total_liabilities_2_years_ago: Option<f64>,
    pub avg_total_stockholders_equity_2_years_ago: Option<f64>,
    pub avg_total_assets_3_years_ago: Option<f64>,
    pub avg_total_liabilities_3_years_ago: Option<f64>,
    pub avg_total_stockholders_equity_3_years_ago: Option<f64>,
    pub avg_total_assets_4_years_ago: Option<f64>,
    pub avg_total_liabilities_4_years_ago: Option<f64>,
    pub avg_total_stockholders_equity_4_years_ago: Option<f64>,
    pub avg_operating_cash_flow_current: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_current: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_current: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_current: Option<f64>,
    pub avg_operating_cash_flow_1_year_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_1_year_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_1_year_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_1_year_ago: Option<f64>,
    pub avg_operating_cash_flow_2_years_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_2_years_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_2_years_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_2_years_ago: Option<f64>,
    pub avg_operating_cash_flow_3_years_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_3_years_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_3_years_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_3_years_ago: Option<f64>,
    pub avg_operating_cash_flow_4_years_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_4_years_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_4_years_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_4_years_ago: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetailResponse {
    pub ticker_id: TickerId,
    pub etf_symbol: String,
    pub exchange_short_name: Option<String>,
    pub etf_name: Option<String>,
    pub top_market_value_sector_name: Option<String>,
    pub top_market_value_industry_name: Option<String>,
    pub top_sector_market_value: f64,
    pub currency_code: String,
    pub top_pct_sector_name: Option<String>,
    pub top_pct_industry_name: Option<String>,
    pub top_pct_sector_weight: f32,
    //
    pub avg_revenue_current: Option<f64>,
    pub avg_gross_profit_current: Option<f64>,
    pub avg_operating_income_current: Option<f64>,
    pub avg_net_income_current: Option<f64>,
    pub avg_revenue_1_year_ago: Option<f64>,
    pub avg_gross_profit_1_year_ago: Option<f64>,
    pub avg_operating_income_1_year_ago: Option<f64>,
    pub avg_net_income_1_year_ago: Option<f64>,
    pub avg_revenue_2_years_ago: Option<f64>,
    pub avg_gross_profit_2_years_ago: Option<f64>,
    pub avg_operating_income_2_years_ago: Option<f64>,
    pub avg_net_income_2_years_ago: Option<f64>,
    pub avg_revenue_3_years_ago: Option<f64>,
    pub avg_gross_profit_3_years_ago: Option<f64>,
    pub avg_operating_income_3_years_ago: Option<f64>,
    pub avg_net_income_3_years_ago: Option<f64>,
    pub avg_revenue_4_years_ago: Option<f64>,
    pub avg_gross_profit_4_years_ago: Option<f64>,
    pub avg_operating_income_4_years_ago: Option<f64>,
    pub avg_net_income_4_years_ago: Option<f64>,
    pub avg_total_assets_current: Option<f64>,
    pub avg_total_liabilities_current: Option<f64>,
    pub avg_total_stockholders_equity_current: Option<f64>,
    pub avg_total_assets_1_year_ago: Option<f64>,
    pub avg_total_liabilities_1_year_ago: Option<f64>,
    pub avg_total_stockholders_equity_1_year_ago: Option<f64>,
    pub avg_total_assets_2_years_ago: Option<f64>,
    pub avg_total_liabilities_2_years_ago: Option<f64>,
    pub avg_total_stockholders_equity_2_years_ago: Option<f64>,
    pub avg_total_assets_3_years_ago: Option<f64>,
    pub avg_total_liabilities_3_years_ago: Option<f64>,
    pub avg_total_stockholders_equity_3_years_ago: Option<f64>,
    pub avg_total_assets_4_years_ago: Option<f64>,
    pub avg_total_liabilities_4_years_ago: Option<f64>,
    pub avg_total_stockholders_equity_4_years_ago: Option<f64>,
    pub avg_operating_cash_flow_current: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_current: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_current: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_current: Option<f64>,
    pub avg_operating_cash_flow_1_year_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_1_year_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_1_year_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_1_year_ago: Option<f64>,
    pub avg_operating_cash_flow_2_years_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_2_years_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_2_years_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_2_years_ago: Option<f64>,
    pub avg_operating_cash_flow_3_years_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_3_years_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_3_years_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_3_years_ago: Option<f64>,
    pub avg_operating_cash_flow_4_years_ago: Option<f64>,
    pub avg_net_cash_provided_by_operating_activities_4_years_ago: Option<f64>,
    pub avg_net_cash_used_for_investing_activities_4_years_ago: Option<f64>,
    pub avg_net_cash_used_provided_by_financing_activities_4_years_ago: Option<f64>,
}

impl ETFAggregateDetail {
    pub async fn get_etf_aggregate_detail_by_ticker_id(
        ticker_id: TickerId,
    ) -> Result<ETFAggregateDetailResponse, JsValue> {
        let url: &str = DataURL::ETFAggregateDetailShardIndex.value();
        let etf_aggregate_detail: ETFAggregateDetail = query_shard_for_id(
            url,
            &ticker_id,
            |etf_aggregate_detail: &ETFAggregateDetail| Some(&etf_aggregate_detail.ticker_id),
        )
        .await?
        .ok_or_else(|| JsValue::from_str("ETF ticker not found"))?;

        // Fetch the symbol and exchange short name
        let (etf_symbol, exchange_short_name) =
            get_symbol_and_exchange_by_ticker_id(ticker_id).await?;

        let top_market_value_sector_name = match etf_aggregate_detail.top_market_value_sector_id {
            Some(top_market_value_sector_id) => {
                SectorById::get_sector_name_with_id(top_market_value_sector_id)
                    .await
                    .ok()
            }
            None => None,
        };

        let top_market_value_industry_name = match etf_aggregate_detail.top_market_value_industry_id
        {
            Some(top_market_value_industry_id) => {
                IndustryById::get_industry_name_with_id(top_market_value_industry_id)
                    .await
                    .ok()
            }
            None => None,
        };

        let top_pct_sector_name = match etf_aggregate_detail.top_pct_sector_id {
            Some(top_pct_sector_id) => SectorById::get_sector_name_with_id(top_pct_sector_id)
                .await
                .ok(),
            None => None,
        };

        let top_pct_industry_name = match etf_aggregate_detail.top_pct_industry_id {
            Some(top_pct_industry_id) => {
                IndustryById::get_industry_name_with_id(top_pct_industry_id)
                    .await
                    .ok()
            }
            None => None,
        };

        let response = ETFAggregateDetailResponse {
            ticker_id: etf_aggregate_detail.ticker_id,
            etf_symbol,
            exchange_short_name,
            etf_name: etf_aggregate_detail.etf_name,
            top_market_value_sector_name,
            top_market_value_industry_name,
            top_sector_market_value: etf_aggregate_detail.top_sector_market_value,
            currency_code: etf_aggregate_detail.currency_code,
            top_pct_sector_name,
            top_pct_industry_name,
            top_pct_sector_weight: etf_aggregate_detail.top_pct_sector_weight,
            //
            avg_revenue_current: etf_aggregate_detail.avg_revenue_current,
            avg_gross_profit_current: etf_aggregate_detail.avg_gross_profit_current,
            avg_operating_income_current: etf_aggregate_detail.avg_operating_income_current,
            avg_net_income_current: etf_aggregate_detail.avg_net_income_current,
            avg_revenue_1_year_ago: etf_aggregate_detail.avg_revenue_1_year_ago,
            avg_gross_profit_1_year_ago: etf_aggregate_detail.avg_gross_profit_1_year_ago,
            avg_operating_income_1_year_ago: etf_aggregate_detail.avg_operating_income_1_year_ago,
            avg_net_income_1_year_ago: etf_aggregate_detail.avg_net_income_1_year_ago,
            avg_revenue_2_years_ago: etf_aggregate_detail.avg_revenue_2_years_ago,
            avg_gross_profit_2_years_ago: etf_aggregate_detail.avg_gross_profit_2_years_ago,
            avg_operating_income_2_years_ago: etf_aggregate_detail.avg_operating_income_2_years_ago,
            avg_net_income_2_years_ago: etf_aggregate_detail.avg_net_income_2_years_ago,
            avg_revenue_3_years_ago: etf_aggregate_detail.avg_revenue_3_years_ago,
            avg_gross_profit_3_years_ago: etf_aggregate_detail.avg_gross_profit_3_years_ago,
            avg_operating_income_3_years_ago: etf_aggregate_detail.avg_operating_income_3_years_ago,
            avg_net_income_3_years_ago: etf_aggregate_detail.avg_net_income_3_years_ago,
            avg_revenue_4_years_ago: etf_aggregate_detail.avg_revenue_4_years_ago,
            avg_gross_profit_4_years_ago: etf_aggregate_detail.avg_gross_profit_4_years_ago,
            avg_operating_income_4_years_ago: etf_aggregate_detail.avg_operating_income_4_years_ago,
            avg_net_income_4_years_ago: etf_aggregate_detail.avg_net_income_4_years_ago,
            avg_total_assets_current: etf_aggregate_detail.avg_total_assets_current,
            avg_total_liabilities_current: etf_aggregate_detail.avg_total_liabilities_current,
            avg_total_stockholders_equity_current: etf_aggregate_detail
                .avg_total_stockholders_equity_current,
            avg_total_assets_1_year_ago: etf_aggregate_detail.avg_total_assets_1_year_ago,
            avg_total_liabilities_1_year_ago: etf_aggregate_detail.avg_total_liabilities_1_year_ago,
            avg_total_stockholders_equity_1_year_ago: etf_aggregate_detail
                .avg_total_stockholders_equity_1_year_ago,
            avg_total_assets_2_years_ago: etf_aggregate_detail.avg_total_assets_2_years_ago,
            avg_total_liabilities_2_years_ago: etf_aggregate_detail
                .avg_total_liabilities_2_years_ago,
            avg_total_stockholders_equity_2_years_ago: etf_aggregate_detail
                .avg_total_stockholders_equity_2_years_ago,
            avg_total_assets_3_years_ago: etf_aggregate_detail.avg_total_assets_3_years_ago,
            avg_total_liabilities_3_years_ago: etf_aggregate_detail
                .avg_total_liabilities_3_years_ago,
            avg_total_stockholders_equity_3_years_ago: etf_aggregate_detail
                .avg_total_stockholders_equity_3_years_ago,
            avg_total_assets_4_years_ago: etf_aggregate_detail.avg_total_assets_4_years_ago,
            avg_total_liabilities_4_years_ago: etf_aggregate_detail
                .avg_total_liabilities_4_years_ago,
            avg_total_stockholders_equity_4_years_ago: etf_aggregate_detail
                .avg_total_stockholders_equity_4_years_ago,
            avg_operating_cash_flow_current: etf_aggregate_detail.avg_operating_cash_flow_current,
            avg_net_cash_provided_by_operating_activities_current: etf_aggregate_detail
                .avg_net_cash_provided_by_operating_activities_current,
            avg_net_cash_used_for_investing_activities_current: etf_aggregate_detail
                .avg_net_cash_used_for_investing_activities_current,
            avg_net_cash_used_provided_by_financing_activities_current: etf_aggregate_detail
                .avg_net_cash_used_provided_by_financing_activities_current,
            avg_operating_cash_flow_1_year_ago: etf_aggregate_detail
                .avg_operating_cash_flow_1_year_ago,
            avg_net_cash_provided_by_operating_activities_1_year_ago: etf_aggregate_detail
                .avg_net_cash_provided_by_operating_activities_1_year_ago,
            avg_net_cash_used_for_investing_activities_1_year_ago: etf_aggregate_detail
                .avg_net_cash_used_for_investing_activities_1_year_ago,
            avg_net_cash_used_provided_by_financing_activities_1_year_ago: etf_aggregate_detail
                .avg_net_cash_used_provided_by_financing_activities_1_year_ago,
            avg_operating_cash_flow_2_years_ago: etf_aggregate_detail
                .avg_operating_cash_flow_2_years_ago,
            avg_net_cash_provided_by_operating_activities_2_years_ago: etf_aggregate_detail
                .avg_net_cash_provided_by_operating_activities_2_years_ago,
            avg_net_cash_used_for_investing_activities_2_years_ago: etf_aggregate_detail
                .avg_net_cash_used_for_investing_activities_2_years_ago,
            avg_net_cash_used_provided_by_financing_activities_2_years_ago: etf_aggregate_detail
                .avg_net_cash_used_provided_by_financing_activities_2_years_ago,
            avg_operating_cash_flow_3_years_ago: etf_aggregate_detail
                .avg_operating_cash_flow_3_years_ago,
            avg_net_cash_provided_by_operating_activities_3_years_ago: etf_aggregate_detail
                .avg_net_cash_provided_by_operating_activities_3_years_ago,
            avg_net_cash_used_for_investing_activities_3_years_ago: etf_aggregate_detail
                .avg_net_cash_used_for_investing_activities_3_years_ago,
            avg_net_cash_used_provided_by_financing_activities_3_years_ago: etf_aggregate_detail
                .avg_net_cash_used_provided_by_financing_activities_3_years_ago,
            avg_operating_cash_flow_4_years_ago: etf_aggregate_detail
                .avg_operating_cash_flow_4_years_ago,
            avg_net_cash_provided_by_operating_activities_4_years_ago: etf_aggregate_detail
                .avg_net_cash_provided_by_operating_activities_4_years_ago,
            avg_net_cash_used_for_investing_activities_4_years_ago: etf_aggregate_detail
                .avg_net_cash_used_for_investing_activities_4_years_ago,
            avg_net_cash_used_provided_by_financing_activities_4_years_ago: etf_aggregate_detail
                .avg_net_cash_used_provided_by_financing_activities_4_years_ago,
        };

        Ok(response)
    }
}
