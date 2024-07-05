use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::JsValue;
use crate::utils::{
  fetch_and_decompress_gz_non_cached,
  fetch_and_decompress_gz,
  parse_json_data
};
use async_trait::async_trait;

pub enum DataUrl {
    DataBuildInfo,
    EtfList,
    SymbolList,
}

impl DataUrl {
    pub fn value(&self) -> &'static str {
        match self {
            DataUrl::DataBuildInfo => "/data/data_build_info.enc",
            DataUrl::EtfList => "/data/etfs.enc",
            DataUrl::SymbolList => "/data/symbols.enc",
        }
    }

    pub fn get_etf_holder_url(symbol: &str) -> String {
        format!("/data/etf_holder.{}.enc", symbol)
    }
}

#[derive(Serialize, Deserialize)]
pub struct DataBuildInfo {
    pub time: String,
    pub hash: String,
}

impl DataBuildInfo {
  pub async fn get_data_build_info() -> Result<DataBuildInfo, JsValue> {
    let url: &str = &DataUrl::DataBuildInfo.value();

    // Fetch and decompress the JSON data
    let json_data = fetch_and_decompress_gz_non_cached(&url).await?;
    
    // Use the `?` operator to propagate the error if `parse_json_data` fails
    let data: DataBuildInfo = parse_json_data(&json_data)?;

    Ok(data)
  }
}

// Option<type> allows null values
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ETF {
    pub symbol: Option<String>,
    pub name: Option<String>,
    pub price: Option<f64>,
    pub exchange: Option<String>,
    #[serde(rename = "exchangeShortName")]
    pub exchange_short_name: Option<String>,
    #[serde(rename = "type")]
    pub entry_type: Option<String>,
}

impl ETF {
  pub async fn count_etfs_per_exchange() -> Result<HashMap<String, usize>, JsValue> {
      let url: &str = DataUrl::EtfList.value();

      let json_data: String = fetch_and_decompress_gz(&url).await?;
      let entries: Vec<ETF> = parse_json_data(&json_data)?;

      let mut counts: HashMap<String, usize> = HashMap::new();
      for entry in entries {
          if let Some(exchange) = &entry.exchange {
              *counts.entry(exchange.clone()).or_insert(0) += 1;
          }
      }
      Ok(counts)
  }

    // TODO: Implement
    // pub fn similarity(&self, portfolio: &Portfolio) -> f64 {
    //     // Example: Simple cosine similarity
    //     // You should replace this with an appropriate financial similarity measure
    //     let mut dot_product = 0.0;
    //     let mut norm_etf = 0.0;
    //     let mut norm_portfolio = 0.0;

    //     for asset in &self.holdings {
    //         let portfolio_asset = portfolio.holdings.iter().find(|&a| a.symbol == asset.symbol);
    //         // TODO: Consider sector and industry here as well
    //         if let Some(port_asset) = portfolio_asset {
    //             dot_product += asset.percentage * port_asset.percentage;
    //         }
    //         norm_etf += asset.percentage.powi(2);
    //     }

    //     for asset in &portfolio.holdings {
    //         norm_portfolio += asset.percentage.powi(2);
    //     }

    //     dot_product / (norm_etf.sqrt() * norm_portfolio.sqrt())
    // }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ETFHolder {
    pub asset: Option<String>,
    pub name: Option<String>,
    pub isin: Option<String>,
    pub cusip: Option<String>,
    #[serde(rename = "sharesNumber")]
    pub shares_number: Option<f64>,
    #[serde(rename = "weightPercentage")]
    pub weight_percentage: Option<f64>,
    #[serde(rename = "marketValue")]
    pub market_value: Option<f64>,
    pub updated: Option<String>,
}

impl ETFHolder {
  pub async fn get_etf_holder_asset_count(symbol: String) -> Result<i32, JsValue> {
      let url: String = DataUrl::get_etf_holder_url(&symbol);

      let json_data: String = fetch_and_decompress_gz(&url).await?;
      let entries: Vec<ETFHolder> = parse_json_data(&json_data)?;

      let mut count: i32 = 0;
      for entry in entries {
          if entry.asset.is_some() {
              count += 1;
          }
      }

      Ok(count)
  }

  pub async fn get_etf_holder_asset_names(symbol: String) -> Result<Vec<String>, JsValue> {
    let url: String = DataUrl::get_etf_holder_url(&symbol);

    let json_data: String = fetch_and_decompress_gz(&url).await?;
    let entries: Vec<ETFHolder> = parse_json_data(&json_data)?;

    let mut asset_names: Vec<String> = Vec::new();
    for entry in entries {
        if let Some(asset) = &entry.asset {
            asset_names.push(asset.clone());
        }
    }

    Ok(asset_names)
  }
}

pub type SymbolList = Vec<String>;

#[async_trait(?Send)]
pub trait SymbolListExt {
    async fn get_symbols() -> Result<SymbolList, JsValue>;
}

#[async_trait(?Send)]
impl SymbolListExt for SymbolList {
    async fn get_symbols() -> Result<SymbolList, JsValue> {
        let url: &str = DataUrl::SymbolList.value();

        // Fetch and decompress the JSON data
        let json_data: String = fetch_and_decompress_gz(&url).await?;
        
        // Parse the JSON data into a SymbolList
        let symbols: SymbolList = serde_json::from_str(&json_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to parse JSON data: {}", err))
        })?;
        
        Ok(symbols)
    }
}
