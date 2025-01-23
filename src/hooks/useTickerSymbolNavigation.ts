import { useCallback } from "react";

import type { RustServiceTickerSymbol } from "@services/RustService";

import useURLState from "./useURLState";

export default function useTickerSymbolNavigation() {
  const { setURLState, toBooleanParam } = useURLState();

  const navigateToSymbol = useCallback(
    (tickerSymbol: RustServiceTickerSymbol) => {
      setURLState(
        {
          query: tickerSymbol,
          exact: toBooleanParam(true),
        },
        false,
        "/search",
      );
    },
    [setURLState, toBooleanParam],
  );

  return navigateToSymbol;
}
