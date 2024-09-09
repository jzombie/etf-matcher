use crate::types::{ExchangeId, TickerId};
use crate::utils::extract_logo_filename;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::JsValue;
use crate::{DataURL, ExchangeById, PaginatedResults};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TickerSearch {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_id: Option<ExchangeId>,
    pub company_name: Option<String>,
    pub logo_filename: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TickerSearchResult {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_short_name: Option<String>,
    pub company_name: Option<String>,
    pub logo_filename: Option<String>,
}

impl TickerSearch {
    // Make initial searches faster
    pub async fn preload_symbol_search_cache() -> Result<(), JsValue> {
        let url: String = DataURL::TickerSearch.value().to_owned();

        // Fetch and decompress the data, properly awaiting the result and handling errors
        fetch_and_decompress_gz(&url, true).await.map_err(|err| {
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

    pub async fn get_all_results() -> Result<Vec<TickerSearch>, JsValue> {
        let url: String = DataURL::TickerSearch.value().to_owned();
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let results: Vec<TickerSearch> = parse_csv_data(csv_string.as_bytes())?;

        Ok(results)
    }

    pub async fn get_result_with_id(ticker_id: TickerId) -> Result<TickerSearch, JsValue> {
        let all_results = Self::get_all_results().await?;

        match all_results
            .into_iter()
            .find(|result| result.ticker_id == ticker_id)
        {
            Some(result) => Ok(result),
            None => Err(JsValue::from_str(&format!(
                "Ticker ID {} not found",
                ticker_id
            ))),
        }
    }

    pub async fn search_tickers(
        query: &str,
        page: usize,
        page_size: usize,
        only_exact_matches: Option<bool>,
    ) -> Result<PaginatedResults<TickerSearchResult>, JsValue> {
        let trimmed_query: String = query.trim().to_lowercase();
        let only_exact_matches = only_exact_matches.unwrap_or(false);

        if trimmed_query.is_empty() {
            return Ok(PaginatedResults {
                total_count: 0,
                results: vec![],
            });
        }

        // TODO: Rename to `all_results`
        let mut results = Self::get_all_results().await?;

        // Extract the logo filename for each result
        for result in &mut results {
            result.logo_filename =
                extract_logo_filename(result.logo_filename.as_deref(), &result.symbol);
        }

        let alternatives: Vec<String> = TickerSearch::generate_alternative_symbols(&trimmed_query);
        let mut exact_symbol_matches: Vec<TickerSearch> = vec![];
        let mut starts_with_matches: Vec<TickerSearch> = vec![];
        let mut contains_matches: Vec<TickerSearch> = vec![];
        let mut reverse_contains_matches: Vec<TickerSearch> = vec![];
        let mut seen_symbols: HashSet<String> = HashSet::new();

        for alternative in &alternatives {
            let query_lower: String = alternative.to_lowercase();
            for result in &results {
                let symbol_lower = result.symbol.to_lowercase();
                let company_lower = result
                    .company_name
                    .as_deref()
                    .map_or("".to_string(), |company_name| company_name.to_lowercase());

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
                    let reverse_partial_company_match_contains =
                        query_lower.contains(&company_lower);

                    if partial_symbol_match_same_start || partial_company_match_same_start {
                        if seen_symbols.insert(symbol_lower.clone()) {
                            starts_with_matches.push(result.clone());
                        }
                    } else if partial_symbol_match_contains || partial_company_match_contains {
                        if seen_symbols.insert(symbol_lower.clone()) {
                            contains_matches.push(result.clone());
                        }
                    } else if (reverse_partial_symbol_match_contains
                        || reverse_partial_company_match_contains)
                        && seen_symbols.insert(symbol_lower.clone())
                    {
                        reverse_contains_matches.push(result.clone());
                    }
                }
            }
        }

        // Combine matches in the desired order
        let mut matches: Vec<TickerSearch> = Vec::with_capacity(
            exact_symbol_matches.len()
                + starts_with_matches.len()
                + contains_matches.len()
                + reverse_contains_matches.len(),
        );
        matches.append(&mut exact_symbol_matches);

        if !only_exact_matches {
            matches.append(&mut starts_with_matches);
            matches.append(&mut contains_matches);
            matches.append(&mut reverse_contains_matches);
        }

        // Paginate the results first
        let paginated_results = PaginatedResults::paginate(matches.clone(), page, page_size)?;

        // Fetch exchange short names for the paginated results
        let mut search_results: Vec<TickerSearchResult> =
            Vec::with_capacity(paginated_results.results.len());
        for result in paginated_results.results {
            let exchange_short_name = if let Some(exchange_id) = result.exchange_id {
                match ExchangeById::get_short_name_by_exchange_id(exchange_id).await {
                    Ok(name) => Some(name),
                    Err(_) => None,
                }
            } else {
                None
            };

            search_results.push(TickerSearchResult {
                ticker_id: result.ticker_id,
                symbol: result.symbol,
                exchange_short_name,
                company_name: result.company_name,
                logo_filename: result.logo_filename,
            });
        }

        // Constructing the final PaginatedResults<TickerSearchResult>
        // This creates a new PaginatedResults instance with the total_count from paginated_results
        // and the results from search_results, which now includes the exchange short names.
        Ok(PaginatedResults {
            total_count: paginated_results.total_count,
            results: search_results,
        })
    }
}
