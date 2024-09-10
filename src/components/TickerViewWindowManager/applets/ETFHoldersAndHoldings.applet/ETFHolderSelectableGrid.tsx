import React, { useCallback, useEffect, useState } from "react";

import { Alert, Box, Divider, Pagination, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import Layout, { Content, Footer } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import SelectableGrid, { SelectableGridItem } from "@components/SelectableGrid";
import Transition from "@components/Transition";

import usePagination from "@hooks/usePagination";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import { fetchETFHoldersAggregateDetail } from "@utils/callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServicePaginatedResults,
  RustServiceTickerDetail,
} from "@utils/callRustService";
import customLogger from "@utils/customLogger";
import formatCurrency from "@utils/formatCurrency";

import { StyledTitle } from "./common";

export type ETFHolderSelectableGridProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function ETFHolderSelectableGrid({
  tickerDetail,
}: ETFHolderSelectableGridProps) {
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

  const navigateToSymbol = useTickerSymbolNavigation();

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

  const handleItemSelect = useCallback(
    (holder: RustServiceETFAggregateDetail) => {
      navigateToSymbol(holder.etf_symbol);
    },
    [navigateToSymbol],
  );

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
        {
          // TODO: Unify all `no information available` into a common component
        }
        <Alert severity="warning">
          There are no known ETF holders for &quot;{tickerSymbol}&quot;.
        </Alert>
      </Center>
    );
  }

  const gridItems: SelectableGridItem<RustServiceETFAggregateDetail>[] =
    paginatedETFHolders.results.map((result) => ({
      id: result.ticker_id,
      data: result,
    }));

  return (
    <Layout>
      <Content>
        <Transition
          direction={!previousPage || page > previousPage ? "left" : "right"}
          trigger={paginatedETFHolders}
        >
          <Scrollable>
            <Padding style={{ paddingTop: 0 }}>
              {paginatedETFHolders.total_count > 1 && page === 1 && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    textAlign: "center",
                  }}
                >
                  &quot;{tickerSymbol}&quot; is found in{" "}
                  {paginatedETFHolders.total_count} ETF
                  {paginatedETFHolders.total_count !== 1 ? "s" : ""}:
                </Typography>
              )}

              <SelectableGrid
                items={gridItems}
                onItemSelect={handleItemSelect}
                renderItem={(holder) => (
                  <div style={{ textAlign: "center" }}>
                    <EncodedImage
                      encSrc={holder.logo_filename}
                      style={{ width: 50, height: 50, marginBottom: 8 }}
                    />

                    <StyledTitle
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", lineHeight: "1.4em" }}
                      gutterBottom
                    >
                      {holder.etf_name}
                    </StyledTitle>

                    <Typography variant="body2">
                      Symbol: {holder.etf_symbol}
                    </Typography>

                    <Typography variant="body2">
                      Expense Ratio:{" "}
                      {holder.expense_ratio
                        ? `${holder.expense_ratio.toFixed(2)}%`
                        : "N/A"}
                    </Typography>

                    <Divider sx={{ margin: 1 }} />

                    <Typography variant="body2">
                      Top Sector Market Value:{" "}
                      {holder.top_sector_market_value
                        ? formatCurrency(
                            holder.currency_code,
                            holder.top_sector_market_value,
                          )
                        : "N/A"}
                    </Typography>

                    <Typography variant="body2">
                      Top Industry:{" "}
                      {holder.top_market_value_industry_name || "N/A"}
                    </Typography>

                    <Typography variant="body2">
                      Top Sector: {holder.top_market_value_sector_name || "N/A"}
                    </Typography>
                  </div>
                )}
              />
            </Padding>
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
