// TODO: Mark `optional` the types which are `Option` types in Rust

// "Level 1"
export type RustServiceSearchResult = {
  symbol: string;
  company: string;
  logo_filename?: string;
};

// "Level 2"
export type RustServiceSymbolDetail = {
  symbol: string;
  company_name: string;
  cik: string;
  country_code: string;
  industry: string;
  sector: string;
  is_etf: boolean;
  score_avg_dca: number;
  logo_filename?: string;
};

export type RustServiceSearchResultsWithTotalCount = {
  total_count: number;
  results: RustServiceSearchResult[];
};

export type RustServiceETFHoldersWithTotalCount = {
  total_count: number;
  results: string[];
};

export type RustServiceCacheDetail = {
  key: string;
  size: string;
  age: number;
  last_accessed: number;
  access_count: number;
};
