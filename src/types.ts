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
  //
  avg_revenue_current?: number;
  avg_gross_profit_current?: number;
  avg_operating_income_current?: number;
  avg_net_income_current?: number;
  avg_revenue_1_year_ago?: number;
  avg_gross_profit_1_year_ago?: number;
  avg_operating_income_1_year_ago?: number;
  avg_net_income_1_year_ago?: number;
  avg_revenue_2_years_ago?: number;
  avg_gross_profit_2_years_ago?: number;
  avg_operating_income_2_years_ago?: number;
  avg_net_income_2_years_ago?: number;
  avg_revenue_3_years_ago?: number;
  avg_gross_profit_3_years_ago?: number;
  avg_operating_income_3_years_ago?: number;
  avg_net_income_3_years_ago?: number;
  avg_revenue_4_years_ago?: number;
  avg_gross_profit_4_years_ago?: number;
  avg_operating_income_4_years_ago?: number;
  avg_net_income_4_years_ago?: number;
  avg_total_assets_current?: number;
  avg_total_liabilities_current?: number;
  avg_total_stockholders_equity_current?: number;
  avg_total_assets_1_year_ago?: number;
  avg_total_liabilities_1_year_ago?: number;
  avg_total_stockholders_equity_1_year_ago?: number;
  avg_total_assets_2_years_ago?: number;
  avg_total_liabilities_2_years_ago?: number;
  avg_total_stockholders_equity_2_years_ago?: number;
  avg_total_assets_3_years_ago?: number;
  avg_total_liabilities_3_years_ago?: number;
  avg_total_stockholders_equity_3_years_ago?: number;
  avg_total_assets_4_years_ago?: number;
  avg_total_liabilities_4_years_ago?: number;
  avg_total_stockholders_equity_4_years_ago?: number;
  avg_operating_cash_flow_current?: number;
  avg_net_cash_provided_by_operating_activities_current?: number;
  avg_net_cash_used_for_investing_activities_current?: number;
  avg_net_cash_used_provided_by_financing_activities_current?: number;
  avg_operating_cash_flow_1_year_ago?: number;
  avg_net_cash_provided_by_operating_activities_1_year_ago?: number;
  avg_net_cash_used_for_investing_activities_1_year_ago?: number;
  avg_net_cash_used_provided_by_financing_activities_1_year_ago?: number;
  avg_operating_cash_flow_2_years_ago?: number;
  avg_net_cash_provided_by_operating_activities_2_years_ago?: number;
  avg_net_cash_used_for_investing_activities_2_years_ago?: number;
  avg_net_cash_used_provided_by_financing_activities_2_years_ago?: number;
  avg_operating_cash_flow_3_years_ago?: number;
  avg_net_cash_provided_by_operating_activities_3_years_ago?: number;
  avg_net_cash_used_for_investing_activities_3_years_ago?: number;
  avg_net_cash_used_provided_by_financing_activities_3_years_ago?: number;
  avg_operating_cash_flow_4_years_ago?: number;
  avg_net_cash_provided_by_operating_activities_4_years_ago?: number;
  avg_net_cash_used_for_investing_activities_4_years_ago?: number;
  avg_net_cash_used_provided_by_financing_activities_4_years_ago?: number;
};

export type RustServiceTicker10KDetail = {
  ticker_id: number;
  calendar_year?: number;
  revenue_current?: number;
  gross_profit_current?: number;
  operating_income_current?: number;
  net_income_current?: number;
  revenue_1_year_ago?: number;
  gross_profit_1_year_ago?: number;
  operating_income_1_year_ago?: number;
  net_income_1_year_ago?: number;
  revenue_2_years_ago?: number;
  gross_profit_2_years_ago?: number;
  operating_income_2_years_ago?: number;
  net_income_2_years_ago?: number;
  revenue_3_years_ago?: number;
  gross_profit_3_years_ago?: number;
  operating_income_3_years_ago?: number;
  net_income_3_years_ago?: number;
  revenue_4_years_ago?: number;
  gross_profit_4_years_ago?: number;
  operating_income_4_years_ago?: number;
  net_income_4_years_ago?: number;
  total_assets_current?: number;
  total_liabilities_current?: number;
  total_stockholders_equity_current?: number;
  total_assets_1_year_ago?: number;
  total_liabilities_1_year_ago?: number;
  total_stockholders_equity_1_year_ago?: number;
  total_assets_2_years_ago?: number;
  total_liabilities_2_years_ago?: number;
  total_stockholders_equity_2_years_ago?: number;
  total_assets_3_years_ago?: number;
  total_liabilities_3_years_ago?: number;
  total_stockholders_equity_3_years_ago?: number;
  total_assets_4_years_ago?: number;
  total_liabilities_4_years_ago?: number;
  total_stockholders_equity_4_years_ago?: number;
  operating_cash_flow_current?: number;
  net_cash_provided_by_operating_activities_current?: number;
  net_cash_used_for_investing_activities_current?: number;
  net_cash_used_provided_by_financing_activities_current?: number;
  operating_cash_flow_1_year_ago?: number;
  net_cash_provided_by_operating_activities_1_year_ago?: number;
  net_cash_used_for_investing_activities_1_year_ago?: number;
  net_cash_used_provided_by_financing_activities_1_year_ago?: number;
  operating_cash_flow_2_years_ago?: number;
  net_cash_provided_by_operating_activities_2_years_ago?: number;
  net_cash_used_for_investing_activities_2_years_ago?: number;
  net_cash_used_provided_by_financing_activities_2_years_ago?: number;
  operating_cash_flow_3_years_ago?: number;
  net_cash_provided_by_operating_activities_3_years_ago?: number;
  net_cash_used_for_investing_activities_3_years_ago?: number;
  net_cash_used_provided_by_financing_activities_3_years_ago?: number;
  operating_cash_flow_4_years_ago?: number;
  net_cash_provided_by_operating_activities_4_years_ago?: number;
  net_cash_used_for_investing_activities_4_years_ago?: number;
  net_cash_used_provided_by_financing_activities_4_years_ago?: number;
  is_current?: boolean;
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
