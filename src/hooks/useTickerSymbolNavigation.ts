import { useCallback } from "react";

import useURLState from "./useURLState";

export default function useTickerSymbolNavigation() {
  const { setURLState, toBooleanParam } = useURLState();

  const navigateToSymbol = useCallback(
    (tickerSymbol: string) => {
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
