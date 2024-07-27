import React from "react";
import { Box, ButtonBase } from "@mui/material";

import type { RustServiceETFAggregateDetail } from "@src/types";
import formatCurrency from "@utils/formatCurrency";

import useURLState from "@hooks/useURLState";

export type ETFHolderProps = {
  etfAggregateDetail: RustServiceETFAggregateDetail;
};

export default function ETFHolderProps({ etfAggregateDetail }: ETFHolderProps) {
  const { setURLState } = useURLState();

  // const navigate = useNavigate();

  // TODO: Look up more information about this symbol (i.e. holdings, etc.)

  return (
    <Box sx={{ paddingBottom: 2 }}>
      <ButtonBase
        onClick={() => {
          setURLState(
            {
              query: etfAggregateDetail.etf_symbol,
            },
            false,
            "/search"
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
            {formatCurrency(
              etfAggregateDetail.currency_code,
              etfAggregateDetail.top_sector_market_value
            )}{" "}
            ({etfAggregateDetail.currency_code})
          </div>
          <div>
            Top Market Value Industry:{" "}
            {etfAggregateDetail.top_market_value_industry_name}
          </div>
          <div>
            Top Market Value Sector:{" "}
            {etfAggregateDetail.top_market_value_sector_name}
          </div>
        </div>
      </ButtonBase>
    </Box>
  );
}
