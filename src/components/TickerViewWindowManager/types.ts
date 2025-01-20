import type { RustServiceTickerSymbol } from "@services/RustService";

export type TickerViewWindowManagerCommonProps = {
  missingAuditedTickerSymbols: RustServiceTickerSymbol[] | null;
  isTickerVectorAuditPending: boolean;
  isTiling: boolean;
};
