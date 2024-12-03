import React, { useMemo, useState } from "react";

import customLogger from "@utils/customLogger";

import BasicTickerSearchModal from "./components/BasicTickerSearchModal";
import TickerSymbolExtractorSelectorDialogModal from "./components/TickerSymbolExtractorSelectorDialogModal";
import type { TickerSearchModalProps } from "./types";

export type { TickerSearchModalProps };

export default function TickerSearchModal({
  open: isOpen,
  onSelectSearchQuery, // TODO: Move elsewhere
  onSelectTicker, // TODO: Pluralize
  onCancel,
  disabledTickerIds,
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
        onSelectSearchQuery={onSelectSearchQuery}
        onSelectTicker={onSelectTicker}
        onCancel={onCancel}
        disabledTickerIds={disabledTickerIds}
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
        // TODO: Memoize
        onSelect={(selectedSearchResults) =>
          customLogger.warn("TODO: Implement multi-search results", {
            selectedSearchResults,
          })
        }
      />
    </>
  );
}
