// "Level 1"
export type RustServiceSearchResult = {
  symbol: string;
  company: string;
};

// "Level 2"
export type RustServiceSymbolDetail = {
  symbol: string;
  cik: string;
  country_code: string;
  industry: string;
  sector: string;
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
