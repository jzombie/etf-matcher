pub fn extract_logo_filename(
    logo_filename_without_extension: Option<&str>,
    symbol: &str,
) -> Option<String> {
    match logo_filename_without_extension {
        // "s" condition uses same filename as logo
        Some("s") => Some(format!("{}.enc", symbol)),
        // "non-s" (but string) condition uses a custom filename as logo
        Some(name) => Some(format!("{}.enc", name)),
        // No logo
        None => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_logo_filename() {
        assert_eq!(
            extract_logo_filename(Some("s"), "AAPL"),
            Some("AAPL.enc".to_string())
        );
        assert_eq!(
            extract_logo_filename(Some("GOOGL"), "GOOGL"),
            Some("GOOGL.enc".to_string())
        );
        assert_eq!(extract_logo_filename(None, "MSFT"), None);
    }
}
