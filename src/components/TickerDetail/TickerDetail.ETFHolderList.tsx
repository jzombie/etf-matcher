import React, { useEffect, useState } from "react";

import { Box, CircularProgress, Pagination } from "@mui/material";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import type {
  RustServiceETFAggregateDetail,
  RustServicePaginatedResults,
  RustServiceTickerDetail,
} from "@src/types";

import Transition from "@components/Transition";

import usePagination from "@hooks/usePagination";
import { store } from "@hooks/useStoreStateReader";

import ETFHolder from "./TickerDetail.ETFHolder";

export type ETFHolderListProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function ETFHolderList({ tickerDetail }: ETFHolderListProps) {
  const tickerId = tickerDetail.ticker_id;
  const tickerSymbol = tickerDetail.symbol;

  const [isLoadingETFHolders, setIsLoadingETFHolders] =
    useState<boolean>(false);

  const [paginatedETFHolders, setPaginatedETFHolders] =
    useState<RustServicePaginatedResults<RustServiceETFAggregateDetail> | null>(
      null,
    );

  const { page, previousPage, setPage, totalPages } = usePagination({
    totalItems: paginatedETFHolders?.total_count,
  });

  useEffect(() => {
    if (tickerId) {
      setIsLoadingETFHolders(true);

      store
        .fetchETFHoldersAggregateDetailByTickerId(tickerId, page)
        .then(setPaginatedETFHolders)
        .finally(() => setIsLoadingETFHolders(false));
    }
  }, [tickerId, page]);

  if (!paginatedETFHolders) {
    return null;
  }

  const paginatedResults = paginatedETFHolders.results;

  if (!paginatedETFHolders && isLoadingETFHolders) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

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
              {isLoadingETFHolders ? (
                <Center>
                  <CircularProgress />
                </Center>
              ) : (
                <div>
                  {paginatedResults.map((etfHolder) => (
                    <ETFHolder
                      key={etfHolder.ticker_id}
                      tickerDetail={tickerDetail}
                      etfAggregateDetail={etfHolder}
                    />
                  ))}
                </div>
              )}
            </Transition>
          </Padding>
        </Box>
      </Padding>
    </Box>
  );
}
