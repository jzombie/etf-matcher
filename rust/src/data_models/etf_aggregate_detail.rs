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
    ticker_id: TickerId,
    etf_name: Option<String>,
    top_market_value_sector_id: Option<SectorId>,
    top_market_value_industry_id: Option<IndustryId>,
    top_sector_market_value: f32,
    currency_code: String,
    top_pct_sector_id: Option<SectorId>,
    top_pct_industry_id: Option<IndustryId>,
    top_pct_sector_weight: f32,
    //
    avg_latest_year: Option<f32>,
    avg_previous_year: Option<f32>,
    avg_latest_revenue: Option<f64>,
    avg_latest_gross_profit: Option<f64>,
    avg_latest_operating_income: Option<f64>,
    avg_latest_net_income: Option<f64>,
    avg_previous_revenue: Option<f64>,
    avg_previous_gross_profit: Option<f64>,
    avg_previous_operating_income: Option<f64>,
    avg_previous_net_income: Option<f64>,
    avg_latest_total_assets: Option<f64>,
    avg_latest_total_liabilities: Option<f64>,
    avg_latest_total_stockholders_equity: Option<f64>,
    avg_previous_total_assets: Option<f64>,
    avg_previous_total_liabilities: Option<f64>,
    avg_previous_total_stockholders_equity: Option<f64>,
    avg_latest_operating_cash_flow: Option<f64>,
    avg_latest_net_cash_provided_by_operating_activities: Option<f64>,
    avg_latest_net_cash_used_for_investing_activities: Option<f64>,
    avg_latest_net_cash_used_provided_by_financing_activities: Option<f64>,
    avg_previous_operating_cash_flow: Option<f64>,
    avg_previous_net_cash_provided_by_operating_activities: Option<f64>,
    avg_previous_net_cash_used_for_investing_activities: Option<f64>,
    avg_previous_net_cash_used_provided_by_financing_activities: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFAggregateDetailResponse {
    pub ticker_id: TickerId,
    pub etf_symbol: String,
    pub exchange_short_name: Option<String>,
    pub etf_name: Option<String>,
    pub top_market_value_sector_name: Option<String>,
    pub top_market_value_industry_name: Option<String>,
    pub top_sector_market_value: f32,
    pub currency_code: String,
    pub top_pct_sector_name: Option<String>,
    pub top_pct_industry_name: Option<String>,
    pub top_pct_sector_weight: f32,
    //
    avg_latest_year: Option<f32>,
    avg_previous_year: Option<f32>,
    avg_latest_revenue: Option<f64>,
    avg_latest_gross_profit: Option<f64>,
    avg_latest_operating_income: Option<f64>,
    avg_latest_net_income: Option<f64>,
    avg_previous_revenue: Option<f64>,
    avg_previous_gross_profit: Option<f64>,
    avg_previous_operating_income: Option<f64>,
    avg_previous_net_income: Option<f64>,
    avg_latest_total_assets: Option<f64>,
    avg_latest_total_liabilities: Option<f64>,
    avg_latest_total_stockholders_equity: Option<f64>,
    avg_previous_total_assets: Option<f64>,
    avg_previous_total_liabilities: Option<f64>,
    avg_previous_total_stockholders_equity: Option<f64>,
    avg_latest_operating_cash_flow: Option<f64>,
    avg_latest_net_cash_provided_by_operating_activities: Option<f64>,
    avg_latest_net_cash_used_for_investing_activities: Option<f64>,
    avg_latest_net_cash_used_provided_by_financing_activities: Option<f64>,
    avg_previous_operating_cash_flow: Option<f64>,
    avg_previous_net_cash_provided_by_operating_activities: Option<f64>,
    avg_previous_net_cash_used_for_investing_activities: Option<f64>,
    avg_previous_net_cash_used_provided_by_financing_activities: Option<f64>,
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
            avg_latest_year: etf_aggregate_detail.avg_latest_year,
            avg_previous_year: etf_aggregate_detail.avg_previous_year,
            avg_latest_revenue: etf_aggregate_detail.avg_latest_revenue,
            avg_latest_gross_profit: etf_aggregate_detail.avg_latest_gross_profit,
            avg_latest_operating_income: etf_aggregate_detail.avg_latest_operating_income,
            avg_latest_net_income: etf_aggregate_detail.avg_latest_net_income,
            avg_previous_revenue: etf_aggregate_detail.avg_previous_revenue,
            avg_previous_gross_profit: etf_aggregate_detail.avg_previous_gross_profit,
            avg_previous_operating_income: etf_aggregate_detail.avg_previous_operating_income,
            avg_previous_net_income: etf_aggregate_detail.avg_previous_net_income,
            avg_latest_total_assets: etf_aggregate_detail.avg_latest_total_assets,
            avg_latest_total_liabilities: etf_aggregate_detail.avg_latest_total_liabilities,
            avg_latest_total_stockholders_equity: etf_aggregate_detail
                .avg_latest_total_stockholders_equity,
            avg_previous_total_assets: etf_aggregate_detail.avg_previous_total_assets,
            avg_previous_total_liabilities: etf_aggregate_detail.avg_previous_total_liabilities,
            avg_previous_total_stockholders_equity: etf_aggregate_detail
                .avg_previous_total_stockholders_equity,
            avg_latest_operating_cash_flow: etf_aggregate_detail.avg_latest_operating_cash_flow,
            avg_latest_net_cash_provided_by_operating_activities: etf_aggregate_detail
                .avg_latest_net_cash_provided_by_operating_activities,
            avg_latest_net_cash_used_for_investing_activities: etf_aggregate_detail
                .avg_latest_net_cash_used_for_investing_activities,
            avg_latest_net_cash_used_provided_by_financing_activities: etf_aggregate_detail
                .avg_latest_net_cash_used_provided_by_financing_activities,
            avg_previous_operating_cash_flow: etf_aggregate_detail.avg_previous_operating_cash_flow,
            avg_previous_net_cash_provided_by_operating_activities: etf_aggregate_detail
                .avg_previous_net_cash_provided_by_operating_activities,
            avg_previous_net_cash_used_for_investing_activities: etf_aggregate_detail
                .avg_previous_net_cash_used_for_investing_activities,
            avg_previous_net_cash_used_provided_by_financing_activities: etf_aggregate_detail
                .avg_previous_net_cash_used_provided_by_financing_activities,
        };

        Ok(response)
    }
}
