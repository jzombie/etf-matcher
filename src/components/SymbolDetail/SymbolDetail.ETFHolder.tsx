import React, { useEffect, useState } from "react";
import { Box, ButtonBase } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { store } from "@hooks/useStoreStateReader";

import type { RustServiceETFAggregateDetail } from "@utils/callRustService";
import formatCurrency from "@utils/formatCurrency";

export type ETFHolderProps = {
  etfTickerId: number;
};

export default function ETFHolderProps({ etfTickerId }: ETFHolderProps) {
  const navigate = useNavigate();

  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);

  useEffect(() => {
    store
      .fetchETFAggregateDetailByTickerId(etfTickerId)
      .then(setETFAggregateDetail);
  }, [etfTickerId]);

  // TODO: Look up more information about this symbol (i.e. holdings, etc.)

  if (!etfAggregateDetail) {
    return null;
  }

  console.log({ etfAggregateDetail });

  // return (
  //   <Box sx={{ paddingBottom: 2 }}>
  //     <ButtonBase
  //       onClick={() => navigate(`/search?query=${etfSymbol}&exact=true`)}
  //       sx={{ display: "block", width: "100%", textAlign: "left" }}
  //     >
  //       <div>
  //         <div style={{ fontWeight: "bold" }}>
  //           {etfAggregateDetail.etf_name} ({etfSymbol})
  //         </div>
  //         <div>
  //           Top Sector Market Value:{" "}
  //           {formatCurrency(
  //             etfAggregateDetail.currency_code,
  //             etfAggregateDetail.top_sector_market_value
  //           )}{" "}
  //           ({etfAggregateDetail.currency_code})
  //         </div>
  //         <div>
  //           Top Market Value Industry:{" "}
  //           {etfAggregateDetail.top_market_value_industry_name}
  //         </div>
  //         <div>
  //           Top Market Value Sector:{" "}
  //           {etfAggregateDetail.top_market_value_sector_name}
  //         </div>
  //       </div>
  //     </ButtonBase>
  //   </Box>
  // );
}
