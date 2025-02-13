use ticker_sniffer;

use crate::types::{ExchangeId, TickerId, TickerSymbol};
use crate::utils::extract_logo_filename;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;

use crate::JsValue;
use crate::{DataURL, Exchange, PaginatedResults};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub struct TickerSearch {
    pub query: String,
    pub page: usize,
    pub page_size: usize,
    pub only_exact_matches: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TickerSearchResultRaw {
    pub ticker_id: TickerId,
    pub symbol: TickerSymbol, // TODO: For consistency, use `ticker_symbol` in data source?
    pub exchange_id: Option<ExchangeId>,
    pub company_name: Option<String>,
    pub logo_filename: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TickerSearchResult {
    pub ticker_id: TickerId,
    pub ticker_symbol: TickerSymbol,
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

    // Retrieves all `raw` results without any transformations
    pub async fn get_all_raw_results() -> Result<Vec<TickerSearchResultRaw>, JsValue> {
        let url: String = DataURL::TickerSearch.value().to_owned();
        let csv_data = fetch_and_decompress_gz(&url, true).await?;
        let csv_string = String::from_utf8(csv_data).map_err(|err| {
            JsValue::from_str(&format!("Failed to convert data to String: {}", err))
        })?;
        let results: Vec<TickerSearchResultRaw> = parse_csv_data(csv_string.as_bytes())?;

        Ok(results)
    }

    // Retrieves a single `raw` result, using the given `ticker_id`
    pub async fn get_raw_result_with_id(
        ticker_id: TickerId,
    ) -> Result<TickerSearchResultRaw, JsValue> {
        let all_raw_results = Self::get_all_raw_results().await?;

        match all_raw_results
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

    // TODO: Remove? Pure alpha-numeric might be a better way
    fn generate_alternative_symbols(query: &str) -> Vec<TickerSymbol> {
        let mut alternatives: Vec<String> = vec![query.to_lowercase()];
        if query.contains('.') {
            alternatives.push(query.replace('.', "-").to_lowercase());
        } else if query.contains('-') {
            alternatives.push(query.replace('-', ".").to_lowercase());
        }
        alternatives
    }

    // TODO: If possible, remove `generate_alternative_symbols` and match on pure alphanumeric
    pub async fn search_tickers(
        &self, // Use `self` to access query parameters
    ) -> Result<PaginatedResults<TickerSearchResult>, JsValue> {
        let trimmed_query: String = self.query.trim().to_lowercase();
        let only_exact_matches = self.only_exact_matches.unwrap_or(false);

        if trimmed_query.is_empty() {
            return Ok(PaginatedResults {
                total_count: 0,
                results: vec![],
            });
        }

        let mut all_raw_results = Self::get_all_raw_results().await?;

        // Extract the logo filename for each result
        for result in &mut all_raw_results {
            result.logo_filename =
                extract_logo_filename(result.logo_filename.as_deref(), &result.symbol);
        }

        let alternatives: Vec<TickerSymbol> = Self::generate_alternative_symbols(&trimmed_query);
        let mut exact_symbol_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut starts_with_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut contains_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut reverse_contains_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut seen_symbols: HashSet<TickerSymbol> = HashSet::new();

        for alternative in &alternatives {
            let query_lower: String = alternative.to_lowercase();
            for result in &all_raw_results {
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
        let mut matches: Vec<TickerSearchResultRaw> = Vec::with_capacity(
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
        let paginated_raw_results =
            PaginatedResults::paginate(matches.clone(), self.page, self.page_size)?;

        // Fetch exchange short names for the paginated results
        let mut search_results: Vec<TickerSearchResult> =
            Vec::with_capacity(paginated_raw_results.results.len());

        for raw_result in paginated_raw_results.results {
            let exchange_short_name = if let Some(exchange_id) = raw_result.exchange_id {
                match Exchange::get_short_name_by_exchange_id(exchange_id).await {
                    Ok(name) => Some(name),
                    Err(_) => None,
                }
            } else {
                None
            };

            search_results.push(TickerSearchResult {
                ticker_id: raw_result.ticker_id,
                ticker_symbol: raw_result.symbol,
                exchange_short_name,
                company_name: raw_result.company_name,
                logo_filename: raw_result.logo_filename,
            });
        }

        // Constructing the final PaginatedResults<TickerSearchResult>
        // This creates a new PaginatedResults instance with the total_count from paginated_results
        // and the results from search_results, which now includes the exchange short names.
        Ok(PaginatedResults {
            total_count: paginated_raw_results.total_count,
            results: search_results,
        })
    }

    // TODO: In final implementation, include frequency scores, and ensure search results are ordered by frequency score by default
    // Note: In `ticker-sniffer` >= 0.1.0-alpha4 there is a `utils::sort_results` method that will do this
    pub async fn extract_results_from_text(
        text: &str,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerSearchResult>, JsValue> {
        // // Step 1: Fetch raw results and construct the symbols map
        let raw_results = Self::get_all_raw_results().await?;

        let is_case_sensitive = true;

        // Step 2: Use `ticker-sniffer` to extract symbols from text
        let ticker_frequency_map =
            ticker_sniffer::extract_tickers_from_text(text, is_case_sensitive)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let extracted_symbols = ticker_frequency_map.keys();

        // Step 3: Map extracted symbols to `TickerSearchResult`
        let mut matches = Vec::new();
        let mut seen_ticker_ids = HashSet::new();

        for symbol in extracted_symbols {
            if let Some(raw_result) = raw_results.iter().find(|result| result.symbol == *symbol) {
                // Avoid duplicates based on `ticker_id`
                if seen_ticker_ids.insert(raw_result.ticker_id) {
                    let exchange_short_name = if let Some(exchange_id) = raw_result.exchange_id {
                        Exchange::get_short_name_by_exchange_id(exchange_id)
                            .await
                            .ok()
                    } else {
                        None
                    };

                    matches.push(TickerSearchResult {
                        ticker_id: raw_result.ticker_id,
                        ticker_symbol: raw_result.symbol.clone(),
                        exchange_short_name,
                        company_name: raw_result.company_name.clone(),
                        logo_filename: extract_logo_filename(
                            raw_result.logo_filename.as_deref(),
                            &raw_result.symbol,
                        ),
                    });
                }
            }
        }

        // Step 4: Apply Pagination Logic
        let paginated_results = PaginatedResults::paginate(matches, page, page_size)?;

        Ok(paginated_results)
    }
}
