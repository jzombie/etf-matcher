import React, { useEffect, useState } from "react";

import { Box, ButtonBase } from "@mui/material";

import store from "@src/store";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@src/types";

import TickerContainer from "@components/TickerContainer";

import useURLState from "@hooks/useURLState";

import customLogger from "@utils/customLogger";
import formatCurrency from "@utils/formatCurrency";

export type ETFHolderProps = {
  etfAggregateDetail: RustServiceETFAggregateDetail;
  holdingTickerDetail: RustServiceTickerDetail;
};

export default function ETFHolderProps({
  etfAggregateDetail,
  holdingTickerDetail,
}: ETFHolderProps) {
  const { setURLState } = useURLState();

  // const navigate = useNavigate();

  // TODO: Look up more information about this symbol (i.e. holdings, etc.)

  const [holdingPercentage, setHoldingPercentage] = useState<number | null>(
    null,
  );
  const [holdingMarketValue, setHoldingMarketValue] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const etfTickerId = etfAggregateDetail.ticker_id;
    const holdingTickerId = holdingTickerDetail.ticker_id;

    customLogger.warn("TODO: Add typings for `fetchETFHoldingWeight`");

    store
      .PROTO_fetchETFHoldingWeight(etfTickerId, holdingTickerId)
      .then((resp) => {
        // @ts-expect-error TODO: Add typings
        setHoldingPercentage(resp.holding_percentage);
        // @ts-expect-error TODO: Add typings
        setHoldingMarketValue(resp.holding_market_value);
      });
  }, [etfAggregateDetail, holdingTickerDetail]);

  return (
    <TickerContainer tickerId={etfAggregateDetail.ticker_id}>
      <Box sx={{ paddingBottom: 2 }}>
        <ButtonBase
          onClick={() => {
            setURLState(
              {
                query: etfAggregateDetail.etf_symbol,
              },
              false,
              "/search",
            );
          }}
          sx={{ display: "block", width: "100%", textAlign: "left" }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>
              {etfAggregateDetail.etf_name} ({etfAggregateDetail.etf_symbol})
            </div>
            <div>
              Top Sector Market Value:{" "}
              {etfAggregateDetail.top_sector_market_value
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.top_sector_market_value,
                  )
                : "N/A"}{" "}
              ({etfAggregateDetail.currency_code})
            </div>
            <div>
              Top Market Value Industry:{" "}
              {etfAggregateDetail.top_market_value_industry_name || "N/A"}
            </div>
            <div>
              Top Market Value Sector:{" "}
              {etfAggregateDetail.top_market_value_sector_name || "N/A"}
            </div>
            <div>
              {holdingTickerDetail.symbol} Holding Percentage:{" "}
              {`${holdingPercentage?.toFixed(2)}%` || "N/A"}
            </div>
            <div>
              {holdingTickerDetail.symbol} Holding Market Value:{" "}
              {holdingMarketValue
                ? formatCurrency(
                    // TODO: This should be set to the currency code of the holding itself
                    etfAggregateDetail.currency_code,
                    holdingMarketValue,
                  )
                : "N/A"}
            </div>
          </div>
        </ButtonBase>
      </Box>
    </TickerContainer>
  );
}
