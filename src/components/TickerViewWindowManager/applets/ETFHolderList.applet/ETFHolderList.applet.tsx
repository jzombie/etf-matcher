import React, { useEffect, useState } from "react";

import { Box, Pagination, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import Layout, { Content, Footer } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import Transition from "@components/Transition";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
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
  const { triggerUIError } = useAppErrorBoundary();

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
          customLogger.error(err);
          triggerUIError(new Error("Could not fetch paginated ETF holders"));
        })
        .finally(() => setIsLoadingETFHolders(false));
    }
  }, [tickerId, page, triggerUIError]);

  if (!paginatedETFHolders && isLoadingETFHolders) {
    return (
      <Center>
        <NetworkProgressIndicator />
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
      <Content>
        {
          // TODO: Show the actual symbol weight in each ETFHolder (send `tickerSymbol` to
          // it and make clear distinction between which symbol is what)
        }

        <Transition
          direction={!previousPage || page > previousPage ? "left" : "right"}
          trigger={paginatedETFHolders}
        >
          <Scrollable>
            {page === 1 && (
              <Typography
                variant="body2"
                sx={{ textAlign: "center", opacity: 0.5 }}
              >
                &quot;{tickerSymbol}&quot; is found in{" "}
                {paginatedETFHolders.total_count} ETF
                {paginatedETFHolders.total_count !== 1 ? "s" : ""}:
              </Typography>
            )}

            {paginatedResults.map((etfHolder) => (
              <ETFHolder
                key={etfHolder.ticker_id}
                holdingTickerDetail={tickerDetail}
                etfAggregateDetail={etfHolder}
              />
            ))}
          </Scrollable>
        </Transition>
        <Cover clickThrough={!isLoadingETFHolders}>
          {isLoadingETFHolders && (
            <Full style={{ backgroundColor: "rgba(0,0,0,.7)" }}>
              <Center>
                <NetworkProgressIndicator />
              </Center>
            </Full>
          )}
        </Cover>
      </Content>
      <Footer>
        {totalPages > 1 && (
          <Box sx={{ textAlign: "center", padding: 1 }}>
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
