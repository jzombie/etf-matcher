import React, { useEffect, useMemo, useState } from "react";
import { Box, Pagination } from "@mui/material";
import ETFHolder from "./SymbolDetail.ETFHolder";
import Transition from "@components/Transition";

import usePagination from "@hooks/usePagination";

import Padding from "@layoutKit/Padding";

import type { RustServiceETFHoldersWithTotalCount } from "@utils/callRustService";

import { store } from "@hooks/useStoreStateReader";

export type ETFHolderListProps = {
  tickerId: number;
};

export default function ETFHolderList({ tickerId }: ETFHolderListProps) {
  const [paginatedETFHolders, setPaginatedETFHolders] =
    useState<RustServiceETFHoldersWithTotalCount | null>(null);

  const { page, previousPage, setPage, totalPages } = usePagination({
    totalItems: paginatedETFHolders?.total_count,
  });

  useEffect(() => {
    if (tickerId) {
      store
        .fetchTickerETFHolderAggregateDetailByTickerId(tickerId, page)
        .then(setPaginatedETFHolders);
    }
  }, [tickerId, page]);

  // const etfSymbols = useMemo<string[] | undefined>(
  //   () => paginatedETFHolders?.results,
  //   [etfHolders]
  // );

  // if (!etfSymbols || !etfHolders) {
  //   return null;
  // }

  // // TODO: Remove
  // console.log({ etfHolders });

  // return null;

  if (!paginatedETFHolders) {
    return null;
  }

  const paginatedResults = paginatedETFHolders.results;

  return (
    <Box>
      <Padding>
        {/* <h3>
          {tickerSymbol} is found in the following {etfHolders.total_count} ETF
          {etfHolders.total_count !== 1 ? "s" : ""}:
        </h3> */}
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
            <Transition
              direction={
                !previousPage || page > previousPage ? "left" : "right"
              }
              trigger={paginatedETFHolders}
            >
              <div>
                {paginatedResults.map((etfHolder) => (
                  <ETFHolder etfAggregateDetail={etfHolder} />
                ))}
              </div>
            </Transition>
          </Padding>
        </Box>
      </Padding>
    </Box>
  );
}
