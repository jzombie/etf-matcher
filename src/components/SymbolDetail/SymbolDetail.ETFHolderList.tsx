import React, { useEffect, useMemo, useState } from "react";
import { Box, Pagination } from "@mui/material";
import ETFHolder from "./SymbolDetail.ETFHolder";

import usePagination from "@hooks/usePagination";

import Padding from "@layoutKit/Padding";

import type { RustServiceETFHoldersWithTotalCount } from "@utils/callWorkerFunction";

import { store } from "@hooks/useStoreStateReader";

export type ETFHolderListProps = {
  tickerSymbol: string;
};

export default function ETFHolderList({ tickerSymbol }: ETFHolderListProps) {
  const [etfHolders, setEtfHolders] = useState<
    RustServiceETFHoldersWithTotalCount | undefined
  >(undefined);

  const { page, setPage, totalPages } = usePagination({
    totalItems: etfHolders?.total_count,
  });

  useEffect(() => {
    if (tickerSymbol) {
      store.fetchSymbolETFHolders(tickerSymbol, page).then(setEtfHolders);
    }
  }, [tickerSymbol, page]);

  const etfSymbols = useMemo<string[] | undefined>(
    () => etfHolders?.results,
    [etfHolders]
  );

  if (!etfSymbols || !etfHolders) {
    return null;
  }

  return (
    <Box>
      <Padding>
        <h3>
          {tickerSymbol} is found in the following {etfHolders.total_count} ETF
          {etfHolders.total_count !== 1 ? "s" : ""}:
        </h3>
        {
          // TODO: Show the actual symbol weight in each ETFHolder (send `tickerSymbol` to
          // it and make clear distinction between which symbol is what)
        }
        <Box sx={{ backgroundColor: "rgba(255,255,255,.05)", borderRadius: 4 }}>
          <Padding>
            {totalPages > 1 && (
              // TODO: When paginating through the list retain the same vertical offset in
              // the `Box` wrapping layer to avoid flash of content issues causing subsequent
              // symbols to reload from the cache
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, nextPage) => setPage(nextPage)}
              />
            )}

            {etfSymbols.map((etfSymbol) => (
              <ETFHolder key={etfSymbol} etfSymbol={etfSymbol} />
            ))}
          </Padding>
        </Box>
      </Padding>
    </Box>
  );
}
