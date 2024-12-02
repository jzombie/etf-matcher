import React, { useMemo, useState } from "react";

import BasicTickerSearchModal from "./components/BasicTickerSearchModal";
import TickerSymbolExtractorSelectorDialogModal from "./components/TickerSymbolExtractorSelectorDialogModal";
import type { TickerSearchModalProps } from "./types";

export type { TickerSearchModalProps };

export default function TickerSearchModal({
  open: isOpen,
  onSelectSearchQuery,
  onSelectTicker,
  onCancel,
  disabledTickerIds,
  textInputPlaceholder,
  searchButtonAriaLabel,
  longFormAriaLabel,
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
        onCancel={() => setIsFullTextMode(false)}
      />
    </>
  );
}
