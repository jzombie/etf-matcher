// FIXME: These consist solely of the `Rust service worker` types and perhaps
// this file should be renamed.

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
  expense_ratio: number;
  exchange_short_name?: string;
  etf_name?: string;
  top_market_value_sector_name?: string;
  top_market_value_industry_name?: string;
  top_sector_market_value?: number;
  currency_code: string;
  top_pct_sector_name?: string;
  top_pct_industry_name?: string;
  top_pct_sector_weight?: number;
  //
  avg_revenue_current?: number;
  avg_revenue_1_yr?: number;
  avg_revenue_2_yr?: number;
  avg_revenue_3_yr?: number;
  avg_revenue_4_yr?: number;
  //
  avg_gross_profit_current?: number;
  avg_gross_profit_1_yr?: number;
  avg_gross_profit_2_yr?: number;
  avg_gross_profit_3_yr?: number;
  avg_gross_profit_4_yr?: number;
  //
  avg_operating_income_current?: number;
  avg_operating_income_1_yr?: number;
  avg_operating_income_2_yr?: number;
  avg_operating_income_3_yr?: number;
  avg_operating_income_4_yr?: number;
  //
  avg_net_income_current?: number;
  avg_net_income_1_yr?: number;
  avg_net_income_2_yr?: number;
  avg_net_income_3_yr?: number;
  avg_net_income_4_yr?: number;
  //
  avg_total_assets_current?: number;
  avg_total_assets_1_yr?: number;
  avg_total_assets_2_yr?: number;
  avg_total_assets_3_yr?: number;
  avg_total_assets_4_yr?: number;
  //
  avg_total_liabilities_current?: number;
  avg_total_liabilities_1_yr?: number;
  avg_total_liabilities_2_yr?: number;
  avg_total_liabilities_3_yr?: number;
  avg_total_liabilities_4_yr?: number;
  //
  avg_total_stockholders_equity_current?: number;
  avg_total_stockholders_equity_1_yr?: number;
  avg_total_stockholders_equity_2_yr?: number;
  avg_total_stockholders_equity_3_yr?: number;
  avg_total_stockholders_equity_4_yr?: number;
  //
  avg_operating_cash_flow_current?: number;
  avg_operating_cash_flow_1_yr?: number;
  avg_operating_cash_flow_2_yr?: number;
  avg_operating_cash_flow_3_yr?: number;
  avg_operating_cash_flow_4_yr?: number;
  //
  avg_net_cash_provided_by_operating_activities_current?: number;
  avg_net_cash_provided_by_operating_activities_1_yr?: number;
  avg_net_cash_provided_by_operating_activities_2_yr?: number;
  avg_net_cash_provided_by_operating_activities_3_yr?: number;
  avg_net_cash_provided_by_operating_activities_4_yr?: number;
  //
  avg_net_cash_used_for_investing_activities_current?: number;
  avg_net_cash_used_for_investing_activities_1_yr?: number;
  avg_net_cash_used_for_investing_activities_2_yr?: number;
  avg_net_cash_used_for_investing_activities_3_yr?: number;
  avg_net_cash_used_for_investing_activities_4_yr?: number;
  //
  avg_net_cash_used_provided_by_financing_activities_current?: number;
  avg_net_cash_used_provided_by_financing_activities_1_yr?: number;
  avg_net_cash_used_provided_by_financing_activities_2_yr?: number;
  avg_net_cash_used_provided_by_financing_activities_3_yr?: number;
  avg_net_cash_used_provided_by_financing_activities_4_yr?: number;
};

export type RustServiceTicker10KDetail = {
  ticker_id: number;
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
};

export type RustServiceETFHoldingWeightResponse = {
  etf_ticker_id: number;
  holding_ticker_id: number;
  holding_market_value: number;
  holding_percentage: number;
};

export type RustServiceETFHoldingTickerResponse = {
  holding_ticker_id: number;
  holding_symbol: string;
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

export type RustServiceTickerDistance = {
  ticker_id: number;
  distance: number;
  original_pca_coords: number[];
  translated_pca_coords: number[];
};

export type RustServiceCosineSimilarityResult = {
  ticker_id: number;
  similarity_score: number;
};

export type RustServiceTickerWithQuantity = {
  ticker_id: number;
  quantity: number;
};
