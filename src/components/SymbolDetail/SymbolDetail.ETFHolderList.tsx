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

  const { page, setPage, totalPages, remaining } = usePagination({
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

  if (!etfSymbols) {
    return null;
  }

  return (
    <Box>
      <Padding>
        <Box sx={{ backgroundColor: "rgba(255,255,255,.05)", borderRadius: 4 }}>
          <Padding>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, nextPage) => setPage(nextPage)}
              />
            )}

            {etfSymbols.map((etfSymbol) => (
              // TODO: Exchange
              <ETFHolder key={etfSymbol} etfSymbol={etfSymbol} />
            ))}
          </Padding>
        </Box>
      </Padding>
    </Box>
  );
}
