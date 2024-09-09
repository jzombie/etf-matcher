import React, { useEffect, useState } from "react";

import { Box, CircularProgress, Pagination, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import Transition from "@components/Transition";

import usePagination from "@hooks/usePagination";

import type {
  RustServiceETFAggregateDetail,
  RustServicePaginatedResults,
  RustServiceTickerDetail,
} from "@utils/callRustService";
import { fetchETFHoldersAggregateDetail } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

import ETFHolder from "./ETFHolderList.Item";

export type ETFHolderListAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function ETFHolderListApplet({
  tickerDetail,
}: ETFHolderListAppletProps) {
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

      fetchETFHoldersAggregateDetail(tickerId, page)
        .then(setPaginatedETFHolders)
        .catch((err) => {
          // TODO: Normalize error handling
          customLogger.error(err);
        })
        .finally(() => setIsLoadingETFHolders(false));
    }
  }, [tickerId, page]);

  if (!paginatedETFHolders && isLoadingETFHolders) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  if (!paginatedETFHolders) {
    return (
      <Center>
        <Typography sx={{ fontWeight: "bold" }}>
          There are no known ETF holders for &quot;{tickerDetail.symbol}&quot;.
        </Typography>
      </Center>
    );
  }

  const paginatedResults = paginatedETFHolders.results;

  return (
    <Layout>
      <Header>
        <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.5 }}>
          &quot;{tickerSymbol}&quot; is found in the following{" "}
          {paginatedETFHolders.total_count} ETF
          {paginatedETFHolders.total_count !== 1 ? "s" : ""}:
        </Typography>
      </Header>
      <Content>
        {
          // TODO: Show the actual symbol weight in each ETFHolder (send `tickerSymbol` to
          // it and make clear distinction between which symbol is what)
        }

        <Transition
          direction={!previousPage || page > previousPage ? "left" : "right"}
          trigger={paginatedETFHolders}
        >
          {isLoadingETFHolders ? (
            <Center>
              <CircularProgress />
            </Center>
          ) : (
            <Scrollable>
              {paginatedResults.map((etfHolder) => (
                <ETFHolder
                  key={etfHolder.ticker_id}
                  holdingTickerDetail={tickerDetail}
                  etfAggregateDetail={etfHolder}
                />
              ))}
            </Scrollable>
          )}
        </Transition>
      </Content>
      <Footer>
        {totalPages > 1 && (
          <Box sx={{ textAlign: "center" }}>
            <Pagination
              sx={{ display: "inline-block" }}
              count={totalPages}
              page={page}
              onChange={(event, nextPage) => setPage(nextPage)}
            />
          </Box>
        )}
      </Footer>
    </Layout>
  );
}
