import React, { useEffect, useState } from "react";

import { CircularProgress, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";
import SelectableGrid, { SelectableGridItem } from "@components/SelectableGrid";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import { fetchETFHoldingsByETFTickerId } from "@utils/callRustService";
import type {
  RustServiceETFHoldingTickerResponse,
  RustServicePaginatedResults,
} from "@utils/callRustService";
import { RustServiceTickerDetail } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

export type ETFHoldingListAppletProps = {
  etfTickerDetail: RustServiceTickerDetail;
};

export default function ETFHoldingListApplet({
  etfTickerDetail,
}: ETFHoldingListAppletProps) {
  const [isLoadingETFHoldings, setIsLoadingETFHoldings] =
    useState<boolean>(false);
  const [paginatedHoldings, setPaginatedHoldings] =
    useState<RustServicePaginatedResults<RustServiceETFHoldingTickerResponse> | null>(
      null,
    );

  useEffect(() => {
    if (etfTickerDetail.is_etf) {
      setIsLoadingETFHoldings(true);
      fetchETFHoldingsByETFTickerId(etfTickerDetail.ticker_id)
        .then(setPaginatedHoldings)
        .catch((err) => {
          // TODO: Normalize error handling
          customLogger.error(err);
        })
        .finally(() => setIsLoadingETFHoldings(false));
    }
  }, [etfTickerDetail]);

  const navigateToSymbol = useTickerSymbolNavigation();

  const handleItemSelect = (holding: RustServiceETFHoldingTickerResponse) => {
    navigateToSymbol(holding.holding_symbol);
  };

  if (!etfTickerDetail.is_etf) {
    return (
      <Center>
        <Typography sx={{ fontWeight: "bold" }}>
          &quot;{etfTickerDetail.symbol}&quot; is not an ETF.
        </Typography>
      </Center>
    );
  }

  if (!paginatedHoldings && isLoadingETFHoldings) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  if (!paginatedHoldings) {
    return null;
  }

  const gridItems: SelectableGridItem<RustServiceETFHoldingTickerResponse>[] =
    paginatedHoldings.results.map((result) => ({
      id: result.holding_ticker_id,
      data: result,
    }));

  return (
    <Scrollable>
      <Padding>
        <SelectableGrid
          items={gridItems}
          onItemSelect={handleItemSelect}
          renderItem={(holding) => (
            <div style={{ textAlign: "center" }}>
              <EncodedImage
                encSrc={holding.logo_filename}
                style={{ width: 50, height: 50, marginBottom: 8 }}
              />
              <Typography variant="subtitle1" gutterBottom>
                {holding.company_name}
              </Typography>
              <Typography variant="body2">
                Symbol: {holding.holding_symbol}
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
