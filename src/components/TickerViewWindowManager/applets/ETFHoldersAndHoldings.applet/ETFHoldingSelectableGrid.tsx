import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Scrollable from "@layoutKit/Scrollable";
import { fetchETFHoldings } from "@services/RustService";
import type {
  RustServiceETFHoldingTicker,
  RustServicePaginatedResults,
} from "@services/RustService";
import { RustServiceTickerDetail } from "@services/RustService";

import EncodedImage from "@components/EncodedImage";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import Padding from "@components/Padding";
import SelectableGrid, { SelectableGridItem } from "@components/SelectableGrid";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";

import { StyledTitle } from "./common";

export type ETFHoldingSelectableGridProps = {
  etfTickerDetail: RustServiceTickerDetail;
};

export default function ETFHoldingSelectableGrid({
  etfTickerDetail,
}: ETFHoldingSelectableGridProps) {
  const [isLoadingETFHoldings, setIsLoadingETFHoldings] =
    useState<boolean>(false);
  const [paginatedHoldings, setPaginatedHoldings] =
    useState<RustServicePaginatedResults<RustServiceETFHoldingTicker> | null>(
      null,
    );

  useEffect(() => {
    if (etfTickerDetail.is_etf) {
      setIsLoadingETFHoldings(true);
      fetchETFHoldings(etfTickerDetail.ticker_symbol)
        .then(setPaginatedHoldings)
        .catch((err) => {
          // TODO: Normalize error handling
          customLogger.error(err);
        })
        .finally(() => setIsLoadingETFHoldings(false));
    }
  }, [etfTickerDetail]);

  const navigateToSymbol = useTickerSymbolNavigation();

  const handleItemSelect = useCallback(
    (holding: RustServiceETFHoldingTicker) => {
      navigateToSymbol(holding.holding_ticker_symbol);
    },
    [navigateToSymbol],
  );

  const gridItems: SelectableGridItem<RustServiceETFHoldingTicker>[] = useMemo(
    () =>
      paginatedHoldings?.results.map((result) => ({
        // Note: `id` is the ID for the `SelectableGridItem`, not the ticker ID
        id: result.holding_ticker_symbol,
        data: result,
      })) || [],
    [paginatedHoldings],
  );

  if (!etfTickerDetail.is_etf) {
    return (
      <Center>
        <NoInformationAvailableAlert>
          &quot;{etfTickerDetail.ticker_symbol}&quot; is not an ETF.
        </NoInformationAvailableAlert>
      </Center>
    );
  }

  if (!paginatedHoldings && isLoadingETFHoldings) {
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (!paginatedHoldings) {
    return null;
  }

  return (
    <Scrollable>
      <Padding style={{ paddingTop: 0 }}>
        {paginatedHoldings.total_count > 1 && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              textAlign: "center",
            }}
          >
            These represent the top holdings in the &quot;
            {etfTickerDetail.ticker_symbol}
            &quot; ETF, listed in order from the largest to the smallest
            allocation.{" "}
          </Typography>
        )}

        <SelectableGrid
          items={gridItems}
          onItemSelect={handleItemSelect}
          renderItem={(holding) => (
            <div style={{ textAlign: "center" }}>
              <EncodedImage
                encSrc={holding.logo_filename}
                style={{ width: 50, height: 50, marginBottom: 8 }}
              />

              <StyledTitle>{holding.company_name}</StyledTitle>
              <Typography variant="body2">
                Symbol: {holding.holding_ticker_symbol}
              </Typography>
              <Typography variant="body2">
                Industry: {holding.industry_name}
              </Typography>
              <Typography variant="body2">
                Sector: {holding.sector_name}
              </Typography>
            </div>
          )}
        />
      </Padding>
    </Scrollable>
  );
}
