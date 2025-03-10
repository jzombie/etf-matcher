// Note: This file consists of types defined within the Rust service, and these types
// use snake_case ("_") naming instead of camelCase.

export type RustServiceTickerSymbol = string;

export type RustServiceDataBuildInfo = {
  time: string;
  hash: string;
};

export type RustServicePaginatedResults<T> = {
  total_count: number;
  results: T[];
};

// "Level 1"
export type RustServiceTickerSearchResult = {
  ticker_symbol: RustServiceTickerSymbol;
  exchange_short_name?: string;
  company_name: string;
  logo_filename?: string;
};

// "Level 2"
export type RustServiceTickerDetail = {
  ticker_symbol: RustServiceTickerSymbol;
  exchange_short_name?: string;
  company_name: string;
  cik?: string;
  country_code?: string;
  currency_code?: string;
  industry_name?: string;
  sector_name?: string;
  is_etf: boolean;
  is_held_in_etf: boolean;
  score_avg_dca: number;
  logo_filename?: string;
};

export type RustServiceTickerWeightedSectorDistribution = {
  major_sector_name: string;
  weight: number;
}[];

export type RustServiceETFAggregateDetail = {
  etf_ticker_symbol: RustServiceTickerSymbol;
  expense_ratio: number;
  etf_name?: string;
  top_market_value_sector_name?: string;
  top_market_value_industry_name?: string;
  top_sector_market_value?: number;
  currency_code?: string;
  logo_filename?: string;
  //
  major_sector_distribution?: {
    major_sector_name: string;
    weight: number;
  }[];
  //
  top_pct_sector_name?: string;
  top_pct_sector_weight?: number;
  top_pct_industry_name?: string;
};

export type RustServiceTicker10KDetail = {
  ticker_symbol: RustServiceTickerSymbol;
  //
  is_current?: boolean;
  //
  calendar_year_current?: number;
  calendar_year_1_yr?: number;
  calendar_year_2_yr?: number;
  calendar_year_3_yr?: number;
  calendar_year_4_yr?: number;
  //
  revenue_current?: number;
  revenue_1_yr?: number;
  revenue_2_yr?: number;
  revenue_3_yr?: number;
  revenue_4_yr?: number;
  //
  gross_profit_current?: number;
  gross_profit_1_yr?: number;
  gross_profit_2_yr?: number;
  gross_profit_3_yr?: number;
  gross_profit_4_yr?: number;
  //
  operating_income_current?: number;
  operating_income_1_yr?: number;
  operating_income_2_yr?: number;
  operating_income_3_yr?: number;
  operating_income_4_yr?: number;
  //
  net_income_current?: number;
  net_income_1_yr?: number;
  net_income_2_yr?: number;
  net_income_3_yr?: number;
  net_income_4_yr?: number;
  //
  total_assets_current?: number;
  total_assets_1_yr?: number;
  total_assets_2_yr?: number;
  total_assets_3_yr?: number;
  total_assets_4_yr?: number;
  //
  total_liabilities_current?: number;
  total_liabilities_1_yr?: number;
  total_liabilities_2_yr?: number;
  total_liabilities_3_yr?: number;
  total_liabilities_4_yr?: number;
  //
  total_stockholders_equity_current?: number;
  total_stockholders_equity_1_yr?: number;
  total_stockholders_equity_2_yr?: number;
  total_stockholders_equity_3_yr?: number;
  total_stockholders_equity_4_yr?: number;
  //
  operating_cash_flow_current?: number;
  operating_cash_flow_1_yr?: number;
  operating_cash_flow_2_yr?: number;
  operating_cash_flow_3_yr?: number;
  operating_cash_flow_4_yr?: number;
  //
  net_cash_provided_by_operating_activities_current?: number;
  net_cash_provided_by_operating_activities_1_yr?: number;
  net_cash_provided_by_operating_activities_2_yr?: number;
  net_cash_provided_by_operating_activities_3_yr?: number;
  net_cash_provided_by_operating_activities_4_yr?: number;
  //
  net_cash_used_for_investing_activities_current?: number;
  net_cash_used_for_investing_activities_1_yr?: number;
  net_cash_used_for_investing_activities_2_yr?: number;
  net_cash_used_for_investing_activities_3_yr?: number;
  net_cash_used_for_investing_activities_4_yr?: number;
  //
  net_cash_used_provided_by_financing_activities_current?: number;
  net_cash_used_provided_by_financing_activities_1_yr?: number;
  net_cash_used_provided_by_financing_activities_2_yr?: number;
  net_cash_used_provided_by_financing_activities_3_yr?: number;
  net_cash_used_provided_by_financing_activities_4_yr?: number;
  //
  are_financials_current: boolean;
};

export type RustServiceETFHoldingWeight = {
  etf_ticker_symbol: RustServiceTickerSymbol;
  holding_ticker_symbol: RustServiceTickerSymbol;
  holding_market_value: number;
  holding_percentage: number;
};

export type RustServiceETFHoldingTicker = {
  holding_ticker_symbol: RustServiceTickerSymbol;
  holding_market_value: number;
  holding_percentage: number;
  company_name?: string;
  industry_name?: string;
  sector_name?: string;
  logo_filename?: string;
  is_etf: boolean;
};

export type RustServiceCacheDetail = {
  name: string;
  size: number;
  age: number;
  last_accessed: number;
  access_count: number;
};

export type RustServiceImageInfo = {
  base64: string;
  rgba: string;
};

export type RustServiceTickerVectorConfig = {
  key: string;
  sort_order: number;
  path: string;
  description?: string;
  last_training_time: Date;
  vector_dimensions: number;
  training_sequence_length: number;
  training_data_sources: string[];
};

export type RustServiceCoord2D = {
  x: number;
  y: number;
};

export type RustServiceTickerDistance = {
  ticker_symbol: RustServiceTickerSymbol;
  distance: number;
  distance_local_normalized: number;
  original_pca_coords: RustServiceCoord2D;
  centered_pca_coords: RustServiceCoord2D;
};

export type RustServiceCosineSimilarityResult = {
  ticker_symbol: RustServiceTickerSymbol;
  similarity_score: number;
};

export type RustServiceTickerWithWeight = {
  ticker_symbol: RustServiceTickerSymbol;
  weight: number;
};
