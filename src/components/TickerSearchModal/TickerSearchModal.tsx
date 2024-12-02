import React from "react";

import BasicTickerSearchModal from "./components/BasicTickerSearchModal";
import type { TickerSearchModalProps } from "./types";

export type { TickerSearchModalProps };

export default function TickerSearchModal({
  onSelectSearchQuery,
  onSelectTicker,
  onCancel,
  disabledTickerIds,
  textInputPlaceholder,
  searchButtonAriaLabel,
  longFormAriaLabel,
  ...rest
}: TickerSearchModalProps) {
  return (
    <BasicTickerSearchModal
      onSelectSearchQuery={onSelectSearchQuery}
      onSelectTicker={onSelectTicker}
      onCancel={onCancel}
      disabledTickerIds={disabledTickerIds}
      textInputPlaceholder={textInputPlaceholder}
      searchButtonAriaLabel={searchButtonAriaLabel}
      longFormAriaLabel={longFormAriaLabel}
      {...rest}
    />
  );
}
