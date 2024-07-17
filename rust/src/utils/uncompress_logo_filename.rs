pub fn uncompress_logo_filename(
  logo_filename_without_extension: Option<&str>,
  symbol: &str,
) -> Option<String> {
  // Expand logo filename using `.enc` extension
  match logo_filename_without_extension {
      Some("s") => Some(format!("{}.enc", symbol)),
      Some(name) => Some(format!("{}.enc", name)),
      None => None,
  }
}

// #[cfg(test)]
// mod tests {
//   use super::*;

//   #[test]
//   fn test_uncompress_logo_filename() {
//       assert_eq!(uncompress_logo_filename(Some("s"), "AAPL"), Some("AAPL".to_string()));
//       assert_eq!(uncompress_logo_filename(Some("GOOGL"), "GOOGL".to_string()));
//       assert_eq!(uncompress_logo_filename(None, "MSFT"), None);
//   }
// }
