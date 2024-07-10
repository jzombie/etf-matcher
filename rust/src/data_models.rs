use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::JsValue;
use crate::utils::{
  fetch_and_decompress_gz_non_cached,
  fetch_and_decompress_gz,
  parse_json_data
};

pub enum DataUrl {
    DataBuildInfo,
    EtfList,
    SymbolSearch
}

impl DataUrl {
    pub fn value(&self) -> &'static str {
        match self {
            DataUrl::DataBuildInfo => "/data/data_build_info.enc",
            DataUrl::EtfList => "/data/etfs.enc",
            DataUrl::SymbolSearch => "/data/symbol_search_dict.enc"
        }
    }

    pub fn get_etf_holder_url(symbol: &str) -> String {
        format!("/data/etf_holder.{}.enc", symbol)
    }

    pub fn get_symbol_detail_url(symbol: &str) -> String {
        let first_char = symbol.chars().next().unwrap_or('O').to_ascii_uppercase();
        format!("/data/symbol_detail.{}.enc", first_char)
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
          if let Some(exchange_short_name) = &entry.exchange_short_name {
              *counts.entry(exchange_short_name.clone()).or_insert(0) += 1;
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

#[derive(Serialize, Deserialize, Debug)]
pub struct PaginatedResults<T> {
    pub total_count: usize,
    pub results: Vec<T>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolSearch {
    #[serde(rename = "s")]
    pub symbol: String,
    #[serde(rename = "c")]
    pub company: Option<String>,
}

impl SymbolSearch {
    pub async fn search_symbols(query: &str, page: usize, page_size: usize) -> Result<PaginatedResults<SymbolSearch>, JsValue> {
        let trimmed_query = query.trim();

        if trimmed_query.is_empty() {
            return Ok(PaginatedResults {
                total_count: 0,
                results: vec![],
            });
        }

        let url: String = DataUrl::SymbolSearch.value().to_owned();

        let json_data: String = fetch_and_decompress_gz(&url).await?;
        let results: Vec<SymbolSearch> = parse_json_data(&json_data)?;

        let query_lower: String = trimmed_query.to_lowercase();
        let matches: Vec<SymbolSearch> = results.into_iter()
            .filter(|result: &SymbolSearch| {
                result.symbol.to_lowercase().contains(&query_lower) ||
                result.company.as_deref().map_or(false, |c| c.to_lowercase().contains(&query_lower))
            })
            .collect();

        let total_count = matches.len();
        let paginated_results: Vec<SymbolSearch> = matches.into_iter()
            .skip((page - 1) * page_size)
            .take(page_size)
            .collect();

        if paginated_results.is_empty() && total_count > 0 {
            Err(JsValue::from_str("Page out of range"))
        } else {
            Ok(PaginatedResults {
                total_count,
                results: paginated_results,
            })
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolDetail {
    pub symbol: String,
    pub company: Option<String>,
    pub industry: Option<String>,
    pub sector: Option<String>,
}

impl SymbolDetail {
    pub async fn get_symbol_detail(symbol: &str) -> Result<SymbolDetail, JsValue> {
        let url: String = DataUrl::get_symbol_detail_url(symbol);
        
        let json_data: String = fetch_and_decompress_gz(&url).await?;
        let details: Vec<SymbolDetail> = parse_json_data(&json_data)?;

        // Find the specific symbol within the shard
        details.into_iter()
            .find(|detail| detail.symbol == symbol)
            .ok_or_else(|| JsValue::from_str("Symbol not found"))
    }
}
