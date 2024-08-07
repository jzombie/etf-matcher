import React, { useEffect, useState } from "react";

import { ButtonBase } from "@mui/material";
import { CircularProgress } from "@mui/material";

import Center from "@layoutKit/Center";
import store from "@src/store";
import type {
  RustServiceETFHoldingTickerResponse,
  RustServicePaginatedResults,
} from "@src/types";
import { RustServiceTickerDetail } from "@src/types";

import EncodedImage from "@components/EncodedImage";

import useURLState from "@hooks/useURLState";

export type ETFHoldingListProps = {
  etfTickerDetail: RustServiceTickerDetail;
};

export default function ETFHoldingList({
  etfTickerDetail,
}: ETFHoldingListProps) {
  const [isLoadingETFHoldings, setIsLoadingETFHoldings] =
    useState<boolean>(false);

  const [paginatedHoldings, setPaginatedHoldings] =
    useState<RustServicePaginatedResults<RustServiceETFHoldingTickerResponse> | null>(
      null,
    );

  useEffect(() => {
    if (etfTickerDetail.is_etf) {
      setIsLoadingETFHoldings(true);

      store
        .fetchETFHoldingsByETFTickerId(etfTickerDetail.ticker_id)
        .then(setPaginatedHoldings)
        .finally(() => setIsLoadingETFHoldings(false));
    }
  }, [etfTickerDetail]);

  const { setURLState, toBooleanParam } = useURLState();

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

  return (
    <div style={{ textAlign: "center" }}>
      {paginatedHoldings.results.map((result) => (
        <ButtonBase
          key={result.holding_ticker_id}
          sx={{ overflow: "auto", margin: 1 }}
          onClick={() =>
            setURLState(
              { query: result.holding_symbol, exact: toBooleanParam(true) },
              false,
              "/search",
            )
          }
        >
          <div>
            <EncodedImage
              encSrc={result.logo_filename}
              style={{ width: 50, height: 50 }}
            />
            <div>Company Name: {result.company_name}</div>
            <div>Symbol: {result.holding_symbol}</div>
            <div>Industry: {result.industry_name}</div>
            <div>Sector: {result.sector_name}</div>
          </div>
        </ButtonBase>
      ))}
    </div>
  );
}
