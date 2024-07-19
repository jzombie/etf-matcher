import React, { useEffect, useMemo, useState } from "react";
import ETFHolder from "./SymbolDetail.ETFHolder";

import type {
  RustServiceSymbolDetail,
  RustServiceETFHoldersWithTotalCount,
  RustServiceETFAggregateDetail,
} from "@utils/callWorkerFunction";

import { store } from "@hooks/useStoreStateReader";

export type ETFHolderListProps = {
  tickerSymbol: string;
};

export default function ETFHolderList({ tickerSymbol }: ETFHolderListProps) {
  const [etfHolders, setEtfHolders] = useState<
    RustServiceETFHoldersWithTotalCount | undefined
  >(undefined);

  useEffect(() => {
    if (tickerSymbol) {
      store.fetchSymbolETFHolders(tickerSymbol).then(setEtfHolders);
    }
  }, [tickerSymbol]);

  const etfSymbols = useMemo<string[] | undefined>(
    () => etfHolders?.results,
    [etfHolders]
  );

  if (!etfSymbols) {
    return null;
  }

  return (
    <div>
      {etfSymbols.map((etfSymbol) => (
        <ETFHolder key={etfSymbol} etfSymbol={etfSymbol} />
      ))}
    </div>
  );
}
