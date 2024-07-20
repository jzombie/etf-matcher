use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use crate::JsValue;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::utils::uncompress_logo_filename;
use crate::data_models::{
    DataURL,
    PaginatedResults,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SymbolSearch {
    pub symbol: String,
    pub company_name: Option<String>,
    pub logo_filename: Option<String>,
}

impl SymbolSearch {
    // Make initial searches faster
    pub async fn preload_symbol_search_cache() -> Result<(), JsValue> {
        let url: String = DataURL::SymbolSearch.value().to_owned();
    
        // Fetch and decompress the data, properly awaiting the result and handling errors
        fetch_and_decompress_gz(&url).await.map_err(|err| {
            JsValue::from_str(&format!("Failed to fetch and decompress data: {:?}", err))
        })?;
        
        Ok(())
    }

    fn generate_alternative_symbols(query: &str) -> Vec<String> {
        let mut alternatives: Vec<String> = vec![query.to_lowercase()];
        if query.contains('.') {
            alternatives.push(query.replace('.', "-").to_lowercase());
        } else if query.contains('-') {
            alternatives.push(query.replace('-', ".").to_lowercase());
        }
        alternatives
    }

    pub async fn search_symbols(
        query: &str, 
        page: usize, 
        page_size: usize, 
        only_exact_matches: Option<bool>
    ) -> Result<PaginatedResults<SymbolSearch>, JsValue> {
        let trimmed_query: String = query.trim().to_lowercase();
        let only_exact_matches = only_exact_matches.unwrap_or(false);

        if trimmed_query.is_empty() {
            return Ok(PaginatedResults {
                total_count: 0,
                results: vec![],
            });
        }

        let url: String = DataURL::SymbolSearch.value().to_owned();
        let csv_data = fetch_and_decompress_gz(&url).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let mut results: Vec<SymbolSearch> = parse_csv_data(csv_string.as_bytes())?;

        // Uncompress the logo filename for each result
        for result in &mut results {
            result.logo_filename = uncompress_logo_filename(result.logo_filename.as_deref(), &result.symbol);
        }

        let alternatives: Vec<String> = SymbolSearch::generate_alternative_symbols(&trimmed_query);
        let mut exact_symbol_matches: Vec<SymbolSearch> = vec![];
        let mut starts_with_matches: Vec<SymbolSearch> = vec![];
        let mut contains_matches: Vec<SymbolSearch> = vec![];
        let mut reverse_contains_matches: Vec<SymbolSearch> = vec![];
        let mut seen_symbols: HashSet<String> = HashSet::new();

        for alternative in &alternatives {
            let query_lower: String = alternative.to_lowercase();
            for result in &results {
                let symbol_lower = result.symbol.to_lowercase();
                let company_lower = result.company_name.as_deref().map_or("".to_string(), |company_name| company_name.to_lowercase());

                let symbol_match = symbol_lower == query_lower;
                let company_match = company_lower == query_lower;

                if symbol_match || company_match {
                    if seen_symbols.insert(symbol_lower.clone()) {
                        exact_symbol_matches.push(result.clone());
                    }
                } else if !only_exact_matches {
                    let partial_symbol_match_same_start = symbol_lower.starts_with(&query_lower);
                    let partial_company_match_same_start = company_lower.starts_with(&query_lower);
                    let partial_symbol_match_contains = symbol_lower.contains(&query_lower);
                    let partial_company_match_contains = company_lower.contains(&query_lower);
                    let reverse_partial_symbol_match_contains = query_lower.contains(&symbol_lower);
                    let reverse_partial_company_match_contains = query_lower.contains(&company_lower);

                    if partial_symbol_match_same_start || partial_company_match_same_start {
                        if seen_symbols.insert(symbol_lower.clone()) {
                            starts_with_matches.push(result.clone());
                        }
                    } else if partial_symbol_match_contains || partial_company_match_contains {
                        if seen_symbols.insert(symbol_lower.clone()) {
                            contains_matches.push(result.clone());
                        }
                    } else if reverse_partial_symbol_match_contains || reverse_partial_company_match_contains {
                        if seen_symbols.insert(symbol_lower.clone()) {
                            reverse_contains_matches.push(result.clone());
                        }
                    }
                }
            }
        }

        // Combine matches in the desired order
        let mut matches: Vec<SymbolSearch> = Vec::with_capacity(
            exact_symbol_matches.len() + starts_with_matches.len() + contains_matches.len() + reverse_contains_matches.len()
        );
        matches.append(&mut exact_symbol_matches);

        if !only_exact_matches {
            matches.append(&mut starts_with_matches);
            matches.append(&mut contains_matches);
            matches.append(&mut reverse_contains_matches);
        }

        PaginatedResults::paginate(matches, page, page_size)
    }
}
