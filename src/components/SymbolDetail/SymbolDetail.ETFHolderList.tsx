import React, { useEffect, useState } from "react";
import { Box, Pagination } from "@mui/material";
import ETFHolder from "./SymbolDetail.ETFHolder";
import Transition from "@components/Transition";

import usePagination from "@hooks/usePagination";

import Padding from "@layoutKit/Padding";

import type {
  RustServiceETFHoldersWithTotalCount,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import { store } from "@hooks/useStoreStateReader";

export type ETFHolderListProps = {
  symbolDetail: RustServiceTickerDetail;
};

export default function ETFHolderList({ symbolDetail }: ETFHolderListProps) {
  const tickerId = symbolDetail.ticker_id;
  const tickerSymbol = symbolDetail.symbol;

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

  if (!paginatedETFHolders) {
    return null;
  }

  const paginatedResults = paginatedETFHolders.results;

  return (
    <Box>
      <Padding>
        <h3>
          {tickerSymbol} is found in the following{" "}
          {paginatedETFHolders.total_count} ETF
          {paginatedETFHolders.total_count !== 1 ? "s" : ""}:
        </h3>
        {
          // TODO: Show the actual symbol weight in each ETFHolder (send `tickerSymbol` to
          // it and make clear distinction between which symbol is what)
        }
        <Box sx={{ backgroundColor: "rgba(255,255,255,.05)", borderRadius: 4 }}>
          <Padding>
            {totalPages > 1 && (
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
                  <ETFHolder
                    key={etfHolder.ticker_id}
                    etfAggregateDetail={etfHolder}
                  />
                ))}
              </div>
            </Transition>
          </Padding>
        </Box>
      </Padding>
    </Box>
  );
}
