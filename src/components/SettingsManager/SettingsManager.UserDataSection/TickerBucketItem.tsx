import React from "react";

import { ButtonBase } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";

import useTickerDetail from "@hooks/useTickerDetail";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

export type TickerBucketItemProps = {
  tickerBucketTicker: TickerBucketTicker;
};

export default function TickerBucketItem({
  tickerBucketTicker,
}: TickerBucketItemProps) {
  const { isLoadingTickerDetail, tickerDetail } = useTickerDetail(
    tickerBucketTicker.symbol,
  );

  const navigateToSymbol = useTickerSymbolNavigation();

  if (isLoadingTickerDetail) {
    return null;
  }

  return (
    <ButtonBase
      title={tickerDetail?.company_name}
      onClick={() => navigateToSymbol(tickerBucketTicker.symbol)}
      style={{ display: "inline-block", margin: 4 }}
    >
      <div>
        <div>
          <AvatarLogo tickerDetail={tickerDetail} />
        </div>
        <div style={{ fontWeight: "bold" }}>{tickerDetail?.ticker_symbol}</div>
      </div>
    </ButtonBase>
  );
}
