import React, { useMemo, useState } from "react";

import BasicTickerSearchModal from "./components/BasicTickerSearchModal";
import TickerSymbolExtractorSelectorDialogModal from "./components/TickerSymbolExtractorSelectorDialogModal";
import type { SearchQueryResult, TickerSearchModalProps } from "./types";

export type { TickerSearchModalProps, SearchQueryResult };

// TODO: Handle disabled in `long-form` mode
// TODO: Limit `long-form` selections, if necessary (max selections)
// TODO: Fix "Adjust `totalSearchResults`" TODO in `BasicTickerSearchModal
// TODO: Implement non-symbol based extraction

export default function TickerSearchModal({
  open: isOpen,
  onSelect,
  onCancel,
  onClose,
  disabledTickerSymbols,
  // TODO: Differentiate between `basic` and `long-form`
  textInputPlaceholder = 'Search for Symbol (e.g. "AAPL" or "Apple")',
  searchButtonAriaLabel = "Ticker Search",
  longFormAriaLabel = "Extract Tickers from Text",
  ...rest
}: TickerSearchModalProps) {
  const [isFullTextMode, setIsFullTextMode] = useState<boolean>(false);

  const isBasicTickerSearchModalOpen = useMemo(() => {
    if (!isOpen) {
      return false;
    }

    if (!isFullTextMode) {
      return true;
    }

    return false;
  }, [isOpen, isFullTextMode]);

  const isTextExtractorModalOpen = useMemo(() => {
    if (!isOpen) {
      return false;
    }

    if (isFullTextMode) {
      return true;
    }

    return false;
  }, [isOpen, isFullTextMode]);

  return (
    <>
      <BasicTickerSearchModal
        open={isBasicTickerSearchModalOpen}
        onSelect={onSelect}
        onCancel={onCancel}
        onClose={onClose}
        disabledTickerSymbols={disabledTickerSymbols}
        textInputPlaceholder={textInputPlaceholder}
        searchButtonAriaLabel={searchButtonAriaLabel}
        longFormAriaLabel={longFormAriaLabel}
        // TODO: Memoize
        onLongFormRequest={() => setIsFullTextMode(true)}
        {...rest}
      />
      <TickerSymbolExtractorSelectorDialogModal
        open={isTextExtractorModalOpen}
        // TODO: Memoize
        onCancel={() => setIsFullTextMode(false)}
        onClose={onClose}
        // TODO: Memoize
        onSelect={(selectedSearchResults) =>
          onSelect(
            selectedSearchResults.map((tickerSearchResult) => ({
              searchQuery: tickerSearchResult.ticker_symbol,
              tickerSearchResult,
              isExact: true,
            })),
          )
        }
      />
    </>
  );
}
