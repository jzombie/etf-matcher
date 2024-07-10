use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::JsValue;
use crate::utils::{
  fetch_and_decompress_gz_non_cached,
  fetch_and_decompress_gz,
  parse_csv_data
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

        // Fetch and decompress the CSV data
        let csv_data = fetch_and_decompress_gz_non_cached(&url).await?;
        
        // Parse the CSV data
        let mut data: Vec<DataBuildInfo> = parse_csv_data(&csv_data)?;
        
        // Expecting a single record
        data.pop().ok_or_else(|| JsValue::from_str("No data found"))
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

        let csv_data: String = fetch_and_decompress_gz(&url).await?;
        let entries: Vec<ETF> = parse_csv_data(&csv_data)?;

        let mut counts: HashMap<String, usize> = HashMap::new();
        for entry in entries {
            if let Some(exchange_short_name) = &entry.exchange_short_name {
                *counts.entry(exchange_short_name.clone()).or_insert(0) += 1;
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
        let url: String = DataUrl::get_etf_holder_url(&symbol);

        let csv_data: String = fetch_and_decompress_gz(&url).await?;
        let entries: Vec<ETFHolder> = parse_csv_data(&csv_data)?;

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

        let csv_data: String = fetch_and_decompress_gz(&url).await?;
        let entries: Vec<ETFHolder> = parse_csv_data(&csv_data)?;

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

// "Level 1"?
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SymbolSearch {
    pub symbol: String,
    pub company: Option<String>,
}

impl SymbolSearch {
    fn generate_alternative_symbols(query: &str) -> Vec<String> {
        let mut alternatives: Vec<String> = vec![query.to_lowercase()];
        if query.contains('.') {
            alternatives.push(query.replace('.', "-").to_lowercase());
        } else if query.contains('-') {
            alternatives.push(query.replace('-', ".").to_lowercase());
        }
        alternatives
    }

    pub async fn search_symbols(query: &str, page: usize, page_size: usize) -> Result<PaginatedResults<SymbolSearch>, JsValue> {
        let trimmed_query: String = query.trim().to_lowercase();

        if trimmed_query.is_empty() {
            return Ok(PaginatedResults {
                total_count: 0,
                results: vec![],
            });
        }

        let url: String = DataUrl::SymbolSearch.value().to_owned();
        let csv_data: String = fetch_and_decompress_gz(&url).await?;
        let results: Vec<SymbolSearch> = parse_csv_data(&csv_data)?;

        let alternatives: Vec<String> = SymbolSearch::generate_alternative_symbols(&trimmed_query);
        let mut exact_symbol_matches: Vec<SymbolSearch> = vec![];
        let mut starts_with_matches: Vec<SymbolSearch> = vec![];
        let mut contains_matches: Vec<SymbolSearch> = vec![];

        for alternative in alternatives {
            let query_lower: String = alternative.to_lowercase();
            for result in &results {
                let symbol_match = result.symbol.to_lowercase() == query_lower;
                let company_match = result.company.as_deref().map_or(false, |company| company.to_lowercase() == query_lower);
                let partial_symbol_match_same_start = result.symbol.to_lowercase().starts_with(&query_lower);
                let partial_company_match_same_start = result.company.as_deref().map_or(false, |company| company.to_lowercase().starts_with(&query_lower));
                let partial_symbol_match_contains = result.symbol.to_lowercase().contains(&query_lower);
                let partial_company_match_contains = result.company.as_deref().map_or(false, |company| company.to_lowercase().contains(&query_lower));

                if symbol_match || company_match {
                    exact_symbol_matches.push(result.clone());
                } else if partial_symbol_match_same_start || partial_company_match_same_start {
                    starts_with_matches.push(result.clone());
                } else if partial_symbol_match_contains || partial_company_match_contains {
                    contains_matches.push(result.clone());
                }
            }
        }

        // Combine matches in the desired order
        let mut matches: Vec<SymbolSearch> = Vec::with_capacity(exact_symbol_matches.len() + starts_with_matches.len() + contains_matches.len());
        matches.append(&mut exact_symbol_matches);
        matches.append(&mut starts_with_matches);
        matches.append(&mut contains_matches);

        let total_count: usize = matches.len();
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

// "Level 2"?
#[derive(Serialize, Deserialize, Debug)]
pub struct SymbolDetail {
    pub symbol: String,
    pub industry: Option<String>,
    pub sector: Option<String>,
}

impl SymbolDetail {
    pub async fn get_symbol_detail(symbol: &str) -> Result<SymbolDetail, JsValue> {
        let url: String = DataUrl::get_symbol_detail_url(symbol);
        
        let csv_data: String = fetch_and_decompress_gz(&url).await?;
        let details: Vec<SymbolDetail> = parse_csv_data(&csv_data)?;

        // Find the specific symbol within the shard
        details.into_iter()
            .find(|detail| detail.symbol == symbol)
            .ok_or_else(|| JsValue::from_str("Symbol not found"))
    }
}
