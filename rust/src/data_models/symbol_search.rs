use serde::{Deserialize, Serialize};
use crate::JsValue;
use crate::utils::fetch::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::data_models::{
  DataURL,
  PaginatedResults
};


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
                } else if !only_exact_matches {
                    if partial_symbol_match_same_start || partial_company_match_same_start {
                        starts_with_matches.push(result.clone());
                    } else if partial_symbol_match_contains || partial_company_match_contains {
                        contains_matches.push(result.clone());
                    }
                }
            }
        }

        // Combine matches in the desired order
        let mut matches: Vec<SymbolSearch> = Vec::with_capacity(exact_symbol_matches.len() + starts_with_matches.len() + contains_matches.len());
        matches.append(&mut exact_symbol_matches);

        if !only_exact_matches {
            matches.append(&mut starts_with_matches);
            matches.append(&mut contains_matches);
        }

        PaginatedResults::paginate(matches, page, page_size)
    }
}
