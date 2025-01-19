import type { RustServiceTickerSearchResult } from "@services/RustService";

import type { DialogModalProps } from "@components/DialogModal";

export type SearchQueryResult = {
  searchQuery: string;
  tickerSearchResult?: RustServiceTickerSearchResult;
  isExact: boolean;
};

export type TickerSearchModalProps = Omit<DialogModalProps, "children"> & {
  onSelect: (searchQueryResults: SearchQueryResult[]) => void;
  onCancel?: () => void;
  disabledTickerSymbols?: string[];
  textInputPlaceholder?: string;
  searchButtonAriaLabel?: string;
  longFormAriaLabel?: string;
};
