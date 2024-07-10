// TODO: Replace w/ SymbolSearch
pub type SymbolList = Vec<String>;

// #[async_trait(?Send)]
// pub trait SymbolListExt {
//     async fn get_symbols() -> Result<SymbolList, JsValue>;
//     async fn search_symbols(query: &str) -> Result<SymbolList, JsValue>;
// }

// fn generate_alternative_symbols(query: &str) -> Vec<String> {
//     let mut alternatives = vec![query.to_lowercase()];
//     if query.contains('.') {
//         alternatives.push(query.replace('.', "-").to_lowercase());
//     } else if query.contains('-') {
//         alternatives.push(query.replace('-', ".").to_lowercase());
//     }
//     alternatives
// }

// #[async_trait(?Send)]
// impl SymbolListExt for SymbolList {
//     async fn get_symbols() -> Result<SymbolList, JsValue> {
//         let url: &str = DataUrl::SymbolList.value();

//         // Fetch and decompress the JSON data
//         let json_data: String = fetch_and_decompress_gz(&url).await?;
        
//         // Parse the JSON data into a SymbolList
//         let symbols: SymbolList = serde_json::from_str(&json_data).map_err(|err| {
//             JsValue::from_str(&format!("Failed to parse JSON data: {}", err))
//         })?;
        
//         Ok(symbols)
//     }

//     async fn search_symbols(query: &str) -> Result<SymbolList, JsValue> {
//         // Check if the query starts with an alphanumeric character
//         let alphanumeric_start = Regex::new(r"^[a-zA-Z0-9]").unwrap();
    
//         if query.is_empty() || !alphanumeric_start.is_match(query) {
//             return Ok(vec![]);
//         }
    
//         let symbols = Self::get_symbols().await?;
//         let query_lower = query.to_lowercase();
//         let alternatives = generate_alternative_symbols(&query_lower);
    
//         let mut matched_symbols: SymbolList = symbols
//             .clone()
//             .into_iter()
//             .filter(|symbol| {
//                 let symbol_lower = symbol.to_lowercase();
//                 alternatives.iter().any(|alt| symbol_lower.contains(alt))
//             })
//             .collect();
    
//         if matched_symbols.len() > 20 {
//             // Check if there is an exact match
//             if let Some(exact_match) = symbols.into_iter().find(|symbol| symbol.eq_ignore_ascii_case(query)) {
//                 matched_symbols = vec![exact_match];
//             } else {
//                 return Ok(vec![]);
//             }
//         }
    
//         Ok(matched_symbols)
//     }
// }