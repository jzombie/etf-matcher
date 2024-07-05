use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::JsValue;
use crate::utils::{fetch_and_decompress_gz, parse_json_data};

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
      let url = DataUrl::EtfList.value();

      let json_data = fetch_and_decompress_gz(&url).await?;
      let entries: Vec<ETF> = parse_json_data(&json_data)?;

      let mut counts: HashMap<String, usize> = HashMap::new();
      for entry in entries {
          if let Some(exchange) = &entry.exchange {
              *counts.entry(exchange.clone()).or_insert(0) += 1;
          }
      }
      Ok(counts)
  }
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
      let url = DataUrl::get_etf_holder_url(&symbol);

      let json_data = fetch_and_decompress_gz(&url).await?;
      let entries: Vec<ETFHolder> = parse_json_data(&json_data)?;

      let mut count = 0;
      for entry in entries {
          if entry.asset.is_some() {
              count += 1;
          }
      }

      Ok(count)
  }

  pub async fn get_etf_holder_asset_names(symbol: String) -> Result<Vec<String>, JsValue> {
    let url = DataUrl::get_etf_holder_url(&symbol);

    let json_data = fetch_and_decompress_gz(&url).await?;
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
