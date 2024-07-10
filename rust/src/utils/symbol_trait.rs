use serde_json::Value;

pub trait HasSymbol {
    fn get_symbol(&self) -> Option<&str>;
}

impl HasSymbol for Value {
    fn get_symbol(&self) -> Option<&str> {
        self.get("symbol")?.as_str()
    }
}
