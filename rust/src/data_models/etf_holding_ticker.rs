use crate::data_models::{DataURL, PaginatedResults, TickerDetail};
use crate::types::TickerId;
use crate::utils::shard::query_shard_for_id;
use crate::JsValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingTicker {
    pub etf_ticker_id: TickerId,
    pub holdings_json: String,
}

// Intermediate JSON parse
#[derive(Serialize, Deserialize, Debug)]
struct ETFHoldingTickerJSON {
    pub holding_ticker_id: TickerId,
    pub holding_market_value: f32,
    pub holding_percentage: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingTickerResponse {
    pub holding_ticker_id: TickerId,
    pub holding_symbol: String,
    pub holding_market_value: f32,
    pub holding_percentage: f32,
    pub company_name: Option<String>,
    pub industry_name: Option<String>,
    pub sector_name: Option<String>,
    pub logo_filename: Option<String>,
    pub is_etf: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingWeightResponse {
    pub etf_ticker_id: TickerId,
    pub holding_ticker_id: TickerId,
    pub holding_market_value: f32,
    pub holding_percentage: f32,
}

impl ETFHoldingTicker {
    pub async fn get_etf_holdings_by_etf_ticker_id(
        etf_ticker_id: TickerId,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<ETFHoldingTickerResponse>, JsValue> {
        let url: &str = DataURL::ETFHoldingTickersShardIndex.value();

        // Query shard for the ETF ticker ID
        let holdings = query_shard_for_id(url, &etf_ticker_id, |detail: &ETFHoldingTicker| {
            Some(&detail.etf_ticker_id)
        })
        .await?
        .ok_or_else(|| JsValue::from_str("ETF ticker not found"))?;

        // Parse the ETF holdings JSON
        let etf_holdings: Vec<ETFHoldingTickerJSON> = serde_json::from_str(&holdings.holdings_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse holdings JSON: {}", e)))?;

        // Retrieve additional information for each holding
        let mut detailed_holdings = Vec::with_capacity(etf_holdings.len());
        for holding in etf_holdings {
            let ticker_detail = TickerDetail::get_ticker_detail(holding.holding_ticker_id).await?;

            detailed_holdings.push(ETFHoldingTickerResponse {
                holding_ticker_id: holding.holding_ticker_id,
                holding_symbol: ticker_detail.symbol,
                holding_market_value: holding.holding_market_value,
                holding_percentage: holding.holding_percentage,
                company_name: Some(ticker_detail.company_name),
                industry_name: ticker_detail.industry_name,
                sector_name: ticker_detail.sector_name,
                logo_filename: ticker_detail.logo_filename,
                is_etf: ticker_detail.is_etf,
            });
        }

        // Paginate the results
        let paginated_results = PaginatedResults::paginate(detailed_holdings, page, page_size)?;

        Ok(paginated_results)
    }

    // A non-paginated direct variant of `get_etf_holdings_by_etf_ticker_id`
    pub async fn get_etf_holding_weight(
        etf_ticker_id: TickerId,
        holding_ticker_id: TickerId,
    ) -> Result<ETFHoldingWeightResponse, JsValue> {
        let url: &str = DataURL::ETFHoldingTickersShardIndex.value();

        // Query shard for the ETF ticker ID
        let holdings = query_shard_for_id(url, &etf_ticker_id, |detail: &ETFHoldingTicker| {
            Some(&detail.etf_ticker_id)
        })
        .await?
        .ok_or_else(|| JsValue::from_str("ETF ticker not found"))?;

        // Parse the ETF holdings JSON
        let etf_holdings: Vec<ETFHoldingTickerJSON> = serde_json::from_str(&holdings.holdings_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse holdings JSON: {}", e)))?;

        // Find the specific holding
        let holding = etf_holdings
            .into_iter()
            .find(|h| h.holding_ticker_id == holding_ticker_id)
            .ok_or_else(|| JsValue::from_str("Holding ticker not found in ETF"))?;

        Ok(ETFHoldingWeightResponse {
            etf_ticker_id,
            holding_ticker_id: holding.holding_ticker_id,
            holding_market_value: holding.holding_market_value,
            holding_percentage: holding.holding_percentage,
        })
    }
}
