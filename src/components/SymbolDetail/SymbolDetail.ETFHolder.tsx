import React, { useEffect, useState } from "react";
import { Box, ButtonBase } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { store } from "@hooks/useStoreStateReader";

import type { RustServiceETFAggregateDetail } from "@utils/callWorkerFunction";

export type ETFHolderProps = {
  etfSymbol: string;
};

export default function ETFHolderProps({ etfSymbol }: ETFHolderProps) {
  const navigate = useNavigate();

  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);

  useEffect(() => {
    store.fetchETFAggregateDetail(etfSymbol).then(setETFAggregateDetail);
  }, [etfSymbol]);

  // TODO: Look up more information about this symbol (i.e. holdings, etc.)

  if (!etfAggregateDetail) {
    return null;
  }

  return (
    <Box sx={{ paddingBottom: 2 }}>
      <ButtonBase
        onClick={() => navigate(`/search?query=${etfSymbol}&exact=true`)}
        sx={{ display: "block", width: "100%", textAlign: "left" }}
      >
        <div>
          {etfSymbol}
          <div>Currency code: {etfAggregateDetail.currency_code}</div>
          <div>
            {
              // TODO: This is a confusing metric; just show total market value for the ETF
            }
            Top Market Value Amount: {etfAggregateDetail.aggregate_market_value}
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
