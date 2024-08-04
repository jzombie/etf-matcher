export type RustServicePaginatedResults<T> = {
  total_count: number;
  results: T[];
};

// "Level 1"
export type RustServiceTickerSearchResult = {
  ticker_id: number;
  symbol: string;
  exchange_short_name?: string;
  company_name: string;
  logo_filename?: string;
};

// "Level 2"
export type RustServiceTickerDetail = {
  ticker_id: number;
  symbol: string;
  exchange_short_name?: string;
  company_name: string;
  cik: string;
  country_code: string;
  industry_name?: string;
  sector_name?: string;
  is_etf: boolean;
  is_held_in_etf: boolean;
  score_avg_dca: number;
  logo_filename?: string;
};

export type RustServiceETFAggregateDetail = {
  ticker_id: number;
  etf_symbol: string;
  exchange_short_name?: string;
  etf_name?: string;
  top_market_value_sector_name?: string;
  top_market_value_industry_name?: string;
  top_sector_market_value?: number;
  currency_code: string;
  top_pct_sector_name?: string;
  top_pct_industry_name?: string;
  top_pct_sector_weight?: number;
};

export type RustServiceETFHoldingTickerResponse = {
  holding_ticker_id: number;
  holding_market_value: number;
  holding_percentage: number;
  company_name?: string;
  industry_name?: string;
  sector_name?: string;
  logo_filename?: string;
  is_etf?: string;
};

export type RustServiceCacheDetail = {
  key: string;
  size: number;
  age: number;
  last_accessed: number;
  access_count: number;
};

export type RustServiceImageInfo = {
  base64: string;
  rgba: string;
};
