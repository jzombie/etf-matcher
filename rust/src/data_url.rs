pub enum DataUrl {
  DataBuildInfo,
  EtfList,
  SymbolList,
}

impl DataUrl {
  pub fn value(&self) -> &'static str {
      match self {
          DataUrl::DataBuildInfo => "/data/data_build_info.enc",
          DataUrl::EtfList => "/data/etfs.enc",
          DataUrl::SymbolList => "/data/symbols.enc",
      }
  }

  pub fn get_etf_holder_url(symbol: &str) -> String {
      format!("/data/etf_holder.{}.enc", symbol)
  }
}
