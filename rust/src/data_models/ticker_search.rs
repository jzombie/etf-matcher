use crate::types::{ExchangeId, TickerId};
use crate::utils::extract_logo_filename;
use crate::utils::fetch_and_decompress::fetch_and_decompress_gz;
use crate::utils::parse::parse_csv_data;
use crate::utils::ticker_utils::generate_alternative_symbols;
use crate::JsValue;
use crate::{DataURL, ExchangeById, PaginatedResults};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

pub struct TickerSearch {
    pub query: String,
    pub page: usize,
    pub page_size: usize,
    pub only_exact_matches: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TickerSearchResultRaw {
    pub ticker_id: TickerId,
    pub symbol: String,
    pub exchange_id: Option<ExchangeId>,
    pub company_name: Option<String>,
    pub logo_filename: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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

        let alternatives: Vec<String> = generate_alternative_symbols(&trimmed_query);
        let mut exact_symbol_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut starts_with_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut contains_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut reverse_contains_matches: Vec<TickerSearchResultRaw> = vec![];
        let mut seen_symbols: HashSet<String> = HashSet::new();

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
        let paginated_results =
            PaginatedResults::paginate(matches.clone(), self.page, self.page_size)?;

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

    // TODO: This algorithm needs to be extracted into a separate library and tested accordingly.
    // The company-name based extraction is very fickle and not good.
    //
    /// Extracts `TickerSearchResult` entries from a given text.
    ///
    /// This method uses the `extract_ticker_ids_from_text` to parse the text for ticker IDs
    /// and then fetches the corresponding `TickerSearchResult` for each valid ticker ID.
    pub async fn extract_results_from_text(
        text: &str,
        page: usize,
        page_size: usize,
    ) -> Result<PaginatedResults<TickerSearchResult>, JsValue> {
        // Tokenize and normalize the input text
        let tokens: Vec<&str> = text
            .split_whitespace()
            .map(|word| word.trim_matches(|c: char| !(c.is_alphanumeric() || c == '-' || c == '.')))
            .filter(|word| !word.is_empty())
            .collect();

        // Fetch all raw results
        let all_raw_results = Self::get_all_raw_results().await?;

        let mut matches = Vec::new();
        let mut seen_ticker_ids = HashSet::new();

        // Step 1: Symbol Matching
        for raw_result in &all_raw_results {
            let symbol_lower = raw_result.symbol.to_lowercase();

            for token in &tokens {
                // Skip tokens that are not fully uppercase in their original form
                if token != &token.to_uppercase() {
                    continue;
                }

                let alternatives = generate_alternative_symbols(token);

                // Check if token or its alternatives match the symbol
                if alternatives.iter().any(|alt| alt == &symbol_lower) {
                    if seen_ticker_ids.insert(raw_result.ticker_id) {
                        let logo_filename = extract_logo_filename(
                            raw_result.logo_filename.as_deref(),
                            &raw_result.symbol,
                        );

                        let exchange_short_name = if let Some(exchange_id) = raw_result.exchange_id
                        {
                            ExchangeById::get_short_name_by_exchange_id(exchange_id)
                                .await
                                .ok()
                        } else {
                            None
                        };

                        matches.push(TickerSearchResult {
                            ticker_id: raw_result.ticker_id,
                            symbol: raw_result.symbol.clone(),
                            exchange_short_name,
                            company_name: raw_result.company_name.clone(),
                            logo_filename,
                        });
                    }
                    break; // Stop further checks once a match is found for this raw_result
                }
            }
        }

        // Note: Special consideration would need to be made if the company is actually called one of these
        //
        // Define a set of common generic words to exclude from matching
        const COMMON_WORDS: &[&str] = &[
            "the",
            "corporation",
            "enterprise",
            "inc",
            "company",
            "limited",
            "llc",
            "group",
            "technologies",
        ];

        // Step 2: Optimized Company Name Matching
        let normalized_text = text
            // .to_lowercase()
            .replace(|c: char| !c.is_alphanumeric() && c != ' ', " "); // Normalize input

        let input_tokens: Vec<&str> = normalized_text
            .split_whitespace()
            .filter(|token| !COMMON_WORDS.contains(token))
            .collect();
        if !input_tokens.is_empty() {
            // Filter input tokens: Only consider tokens starting with a capital letter and of sufficient length
            let input_tokens_capitalized: Vec<String> = input_tokens
                .iter()
                .filter(|token| {
                    token.chars().next().map_or(false, |c| c.is_uppercase()) && token.len() > 1
                }) // Min length > 1
                .map(|token| token.to_lowercase()) // Normalize to lowercase for matching
                .collect();

            let mut scored_results: HashMap<u32, f32> = HashMap::new();

            for raw_result in &all_raw_results {
                // Skip already-matched results
                if seen_ticker_ids.contains(&raw_result.ticker_id) {
                    continue;
                }

                // Ensure the company name exists
                let company_name = raw_result.company_name.as_deref();
                if company_name.is_none() || company_name.unwrap().is_empty() {
                    continue; // Skip results with no company name
                }

                // Normalize and tokenize the company name
                let company_lower = company_name
                    .unwrap()
                    .to_lowercase()
                    .replace(|c: char| !c.is_alphanumeric() && c != ' ', " ");
                let company_tokens: Vec<String> =
                    company_lower.split_whitespace().map(String::from).collect();
                let total_company_words = company_tokens.len();

                if company_tokens.is_empty() {
                    continue; // Skip empty names
                }

                let mut match_score = 0.0;
                let mut token_index = 0;

                // Attempt to match consecutive tokens
                while token_index < input_tokens_capitalized.len() {
                    let mut consecutive_match_count = 0;
                    let mut start_index = None;

                    for (company_index, company_token) in company_tokens.iter().enumerate() {
                        if input_tokens_capitalized[token_index] == *company_token {
                            if start_index.is_none() {
                                start_index = Some(company_index);
                            }
                            consecutive_match_count += 1;
                            token_index += 1;
                            if token_index == input_tokens_capitalized.len() {
                                break; // No more tokens to match
                            }
                        } else if start_index.is_some() {
                            break; // End of consecutive match
                        }
                    }

                    if consecutive_match_count > 0 {
                        let consecutive_score =
                            consecutive_match_count as f32 / total_company_words as f32;
                        match_score += consecutive_score;
                    } else {
                        token_index += 1; // Move to the next token if no match was found
                    }
                }

                // Penalize results with extra unrelated words
                match_score /= total_company_words as f32;

                // Skip if no meaningful match
                if match_score == 0.0 {
                    continue;
                }

                // Aggregate score for this company
                scored_results
                    .entry(raw_result.ticker_id)
                    .and_modify(|e| *e += match_score)
                    .or_insert(match_score);
            }

            // Convert scored results to a sorted list
            let mut results: Vec<(f32, &TickerSearchResultRaw)> = scored_results
                .into_iter()
                .map(|(id, score)| {
                    let raw_result = all_raw_results
                        .iter()
                        .find(|r| r.ticker_id == id)
                        .expect("Ticker ID mismatch");
                    (score, raw_result)
                })
                .collect();

            results.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

            // Apply a threshold (e.g., 80% of the highest score)
            let max_score = results.first().map(|(score, _)| *score).unwrap_or(0.0);
            let threshold = max_score * 0.8;

            for (score, raw_result) in results {
                if score < threshold {
                    break;
                }

                if seen_ticker_ids.insert(raw_result.ticker_id) {
                    let logo_filename = extract_logo_filename(
                        raw_result.logo_filename.as_deref(),
                        &raw_result.symbol,
                    );

                    let exchange_short_name = if let Some(exchange_id) = raw_result.exchange_id {
                        ExchangeById::get_short_name_by_exchange_id(exchange_id)
                            .await
                            .ok()
                    } else {
                        None
                    };

                    matches.push(TickerSearchResult {
                        ticker_id: raw_result.ticker_id,
                        symbol: raw_result.symbol.clone(),
                        exchange_short_name,
                        company_name: raw_result.company_name.clone(),
                        logo_filename,
                    });
                }
            }
        }

        // Step 3: Sort and Paginate Results
        matches.sort_by(|a, b| a.symbol.cmp(&b.symbol));

        let total_count = matches.len();
        let start = page.saturating_sub(1).saturating_mul(page_size);
        let end = start + page_size;

        let paginated_results = if start < total_count {
            matches[start..total_count.min(end)].to_vec()
        } else {
            vec![]
        };

        Ok(PaginatedResults {
            total_count,
            results: paginated_results,
        })
    }
}
