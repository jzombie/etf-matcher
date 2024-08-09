import React from "react";

import { ButtonBase } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import EncodedImage from "@components/EncodedImage";

import useImageBackgroundColor from "@hooks/useImageBackgroundColor";
import useTickerDetail from "@hooks/useTickerDetail";
import useURLState from "@hooks/useURLState";

export type TickerBucketItemProps = {
  tickerBucketTicker: TickerBucketTicker;
};

export default function TickerBucketItem({
  tickerBucketTicker,
}: TickerBucketItemProps) {
  const { isLoadingTickerDetail, tickerDetail } = useTickerDetail(
    tickerBucketTicker.tickerId,
  );

  const logoBgColor = useImageBackgroundColor(tickerDetail?.logo_filename);

  const { setURLState, toBooleanParam } = useURLState();

  if (isLoadingTickerDetail) {
    return null;
  }

  return (
    <ButtonBase
      title={tickerDetail?.company_name}
      onClick={() =>
        setURLState(
          { query: tickerBucketTicker.symbol, exact: toBooleanParam(true) },
          false,
          "/search",
        )
      }
      style={{ display: "inline-block", margin: 4 }}
    >
      <div>
        <div>
          <EncodedImage
            encSrc={tickerDetail?.logo_filename}
            style={{
              width: 50,
              height: 50,
              border: `4px ${logoBgColor} solid`,
              borderRadius: 50,
              overflow: "hidden",
            }}
          />
        </div>
        <div style={{ fontWeight: "bold" }}>{tickerDetail?.symbol}</div>
      </div>
    </ButtonBase>
  );
}
