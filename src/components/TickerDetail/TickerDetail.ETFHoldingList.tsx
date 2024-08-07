import React, { useEffect, useState } from "react";

import { ButtonBase } from "@mui/material";

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
  const [paginatedHoldings, setPaginatedHoldings] =
    useState<RustServicePaginatedResults<RustServiceETFHoldingTickerResponse> | null>(
      null,
    );

  useEffect(() => {
    if (etfTickerDetail.is_etf) {
      store
        .fetchETFHoldingsByETFTickerId(etfTickerDetail.ticker_id)
        .then(setPaginatedHoldings);
    }
  }, [etfTickerDetail]);

  const { setURLState, toBooleanParam } = useURLState();

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
