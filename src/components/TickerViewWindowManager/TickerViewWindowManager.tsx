import React from "react";

import TickerContainer from "@components/TickerContainer";
import WindowManager from "@components/WindowManager";

import TickerViewWindowManagerBucketManager from "./TickerViewWindowManager.BucketManager";
import useTickerViewWindowManagerContent from "./hooks/useTickerViewWindowManagerContent";

export type TickerViewWindowManagerProps = {
  tickerId: number;
};

export default function TickerViewWindowManager({
  tickerId,
}: TickerViewWindowManagerProps) {
  // TODO: Don't hardcode
  const isTiling = true;

  const { initialLayout, contentMap, tickerDetail } =
    useTickerViewWindowManagerContent(tickerId, isTiling);

  return (
    <TickerContainer tickerId={tickerId}>
      <WindowManager initialLayout={initialLayout} contentMap={contentMap} />
      {tickerDetail && (
        <TickerViewWindowManagerBucketManager tickerDetail={tickerDetail} />
      )}
    </TickerContainer>
  );
}
