use serde::{Deserialize, Serialize};

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

pub type SymbolList = Vec<String>;
