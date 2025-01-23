use crate::types::{TickerId, TickerSymbol};
use crate::utils::shard::query_shard_for_id;
use crate::utils::ticker_utils;
use crate::JsValue;
use crate::{DataURL, PaginatedResults, TickerDetail};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingTickerRaw {
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
pub struct ETFHoldingTicker {
    pub holding_ticker_id: TickerId,
    pub holding_ticker_symbol: TickerSymbol,
    pub holding_market_value: f32,
    pub holding_percentage: f32,
    pub company_name: Option<String>,
    pub industry_name: Option<String>,
    pub sector_name: Option<String>,
    pub logo_filename: Option<String>,
    pub is_etf: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ETFHoldingWeight {
    pub etf_ticker_symbol: TickerSymbol,
    pub holding_ticker_symbol: TickerSymbol,
    pub holding_market_value: f32,
    pub holding_percentage: f32,
}

impl ETFHoldingTicker {
    pub async fn get_etf_holdings(
        etf_ticker_symbol: TickerSymbol,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<ETFHoldingTicker>, JsValue> {
        let url: &str = &DataURL::ETFHoldingTickersShardIndex.value();

        let etf_ticker_id = ticker_utils::get_ticker_id(etf_ticker_symbol.clone())
            .await
            .map_err(|err| {
                JsValue::from_str(&format!(
                    "Could not fetch ticker ID for ETF ticker symbol: {} {:?}",
                    etf_ticker_symbol, err
                ))
            })?;

        // Query shard for the ETF ticker ID
        let holdings = query_shard_for_id(url, &etf_ticker_id, |detail: &ETFHoldingTickerRaw| {
            Some(&detail.etf_ticker_id)
        })
        .await?
        .ok_or_else(|| JsValue::from_str(&format!("ETF ticker ID {} not found", etf_ticker_id)))?;

        // Parse the ETF holdings JSON
        let etf_holdings: Vec<ETFHoldingTickerJSON> = serde_json::from_str(&holdings.holdings_json)
            .map_err(|e| {
                JsValue::from_str(&format!(
                    "Failed to parse holdings JSON for ETF ticker ID {}: {}",
                    etf_ticker_id, e
                ))
            })?;

        // Retrieve additional information for each holding
        let mut detailed_holdings = Vec::with_capacity(etf_holdings.len());
        for holding in etf_holdings {
            let holding_ticker_symbol = ticker_utils::get_ticker_symbol(holding.holding_ticker_id)
                .await
                .map_err(|err| {
                    JsValue::from_str(&format!(
                        "Could not fetch ticker symbol for holding ticker ID: {} {:?}",
                        holding.holding_ticker_id, err
                    ))
                })?;

            match TickerDetail::get_ticker_detail(holding_ticker_symbol).await {
                Ok(ticker_detail) => {
                    detailed_holdings.push(ETFHoldingTicker {
                        holding_ticker_id: holding.holding_ticker_id,
                        holding_ticker_symbol: ticker_detail.ticker_symbol,
                        holding_market_value: holding.holding_market_value,
                        holding_percentage: holding.holding_percentage,
                        company_name: Some(ticker_detail.company_name),
                        industry_name: ticker_detail.industry_name,
                        sector_name: ticker_detail.sector_name,
                        logo_filename: ticker_detail.logo_filename,
                        is_etf: ticker_detail.is_etf,
                    });
                }
                Err(e) => {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Failed to get ticker detail for holding_ticker_id (via get_etf_holdings): {}. Error: {:?}",
                        holding.holding_ticker_id, e
                    )));
                    continue; // Skip to the next iteration
                }
            }
        }

        // Paginate the results
        let paginated_results = PaginatedResults::paginate(detailed_holdings, page, page_size)?;

        Ok(paginated_results)
    }

    // A non-paginated direct variant of `get_etf_holdings`
    pub async fn get_etf_holding_weight(
        etf_ticker_symbol: TickerSymbol,
        holding_ticker_symbol: TickerSymbol,
    ) -> Result<ETFHoldingWeight, JsValue> {
        let url: &str = &DataURL::ETFHoldingTickersShardIndex.value();

        let etf_ticker_id = ticker_utils::get_ticker_id(etf_ticker_symbol.clone())
            .await
            .map_err(|err| {
                JsValue::from_str(&format!(
                    "Could not fetch ticker ID for ETF ticker symbol: {} {:?}",
                    etf_ticker_symbol, err
                ))
            })?;

        let holding_ticker_id = ticker_utils::get_ticker_id(holding_ticker_symbol.clone())
            .await
            .map_err(|err| {
                JsValue::from_str(&format!(
                    "Could not fetch ticker ID for ETF holding ticker symbol: {} {:?}",
                    holding_ticker_symbol, err
                ))
            })?;

        // Query shard for the ETF ticker ID
        let holdings = query_shard_for_id(url, &etf_ticker_id, |detail: &ETFHoldingTickerRaw| {
            Some(&detail.etf_ticker_id)
        })
        .await?
        .ok_or_else(|| JsValue::from_str(&format!("ETF ticker ID {} not found", etf_ticker_id)))?;

        // Parse the ETF holdings JSON
        let etf_holdings: Vec<ETFHoldingTickerJSON> = serde_json::from_str(&holdings.holdings_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse holdings JSON: {}", e)))?;

        // Find the specific holding
        let holding = etf_holdings
            .into_iter()
            .find(|h| h.holding_ticker_id == holding_ticker_id)
            .ok_or_else(|| {
                JsValue::from_str(&format!(
                    "Holding ticker ID {} not found in ETF",
                    holding_ticker_id
                ))
            })?;

        let holding_ticker_symbol = ticker_utils::get_ticker_symbol(holding.holding_ticker_id)
            .await
            .map_err(|err| {
                JsValue::from_str(&format!(
                    "Could not fetch ticker symbol for holding ticker ID: {} {:?}",
                    holding.holding_ticker_id, err
                ))
            })?;

        Ok(ETFHoldingWeight {
            etf_ticker_symbol,
            holding_ticker_symbol: holding_ticker_symbol,
            holding_market_value: holding.holding_market_value,
            holding_percentage: holding.holding_percentage,
        })
    }
}
