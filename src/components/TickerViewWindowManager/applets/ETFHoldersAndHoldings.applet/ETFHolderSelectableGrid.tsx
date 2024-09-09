import React, { useCallback, useEffect, useState } from "react";

import { Divider, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import SelectableGrid, { SelectableGridItem } from "@components/SelectableGrid";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import { fetchETFHoldersAggregateDetail } from "@utils/callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServicePaginatedResults,
  RustServiceTickerDetail,
} from "@utils/callRustService";
import customLogger from "@utils/customLogger";
import formatCurrency from "@utils/formatCurrency";

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

  const navigateToSymbol = useTickerSymbolNavigation();

  useEffect(() => {
    if (tickerId) {
      setIsLoadingETFHolders(true);

      fetchETFHoldersAggregateDetail(tickerId)
        .then(setPaginatedETFHolders)
        .catch((err) => {
          // TODO: Normalize error handling
          customLogger.error(err);
        })
        .finally(() => setIsLoadingETFHolders(false));
    }
  }, [tickerId]);

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
        <Typography sx={{ fontWeight: "bold" }}>
          There are no known ETF holders for &quot;{tickerSymbol}&quot;.
        </Typography>
      </Center>
    );
  }

  const gridItems: SelectableGridItem<RustServiceETFAggregateDetail>[] =
    paginatedETFHolders.results.map((result) => ({
      id: result.ticker_id,
      data: result,
    }));

  return (
    <Scrollable>
      <Padding style={{ paddingTop: 0 }}>
        {paginatedETFHolders.total_count > 1 && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.5,
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

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold" }}
                gutterBottom
              >
                {holder.etf_name}
              </Typography>

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
                Top Industry: {holder.top_market_value_industry_name || "N/A"}
              </Typography>

              <Typography variant="body2">
                Top Sector: {holder.top_market_value_sector_name || "N/A"}
              </Typography>
            </div>
          )}
        />
      </Padding>
    </Scrollable>
  );
}
