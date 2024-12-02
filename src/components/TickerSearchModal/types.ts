import type { RustServiceTickerSearchResult } from "@services/RustService";

import type { DialogModalProps } from "@components/DialogModal";

export type TickerSearchModalProps = Omit<DialogModalProps, "children"> & {
  onSelectSearchQuery?: (searchQuery: string, isExact: boolean) => void;
  onSelectTicker?: (searchResult: RustServiceTickerSearchResult) => void;
  onCancel?: () => void;
  disabledTickerIds?: number[];
  textInputPlaceholder?: string;
  searchButtonAriaLabel?: string;
  longFormAriaLabel?: string;
};
