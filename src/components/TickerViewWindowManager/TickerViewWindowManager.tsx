import React, { useState } from "react";

import TickerContainer from "@components/TickerContainer";
import WindowManager from "@components/WindowManager";

import TickerViewWindowManagerBucketManager from "./components/TickerViewWindowManager.BucketManager";
import useTickerViewWindowManagerContent from "./hooks/useTickerViewWindowManagerContent";

export type TickerViewWindowManagerProps = {
  tickerId: number;
};

export default function TickerViewWindowManager({
  tickerId,
}: TickerViewWindowManagerProps) {
  const [isTiling, setIsTiling] = useState(true);

  const { initialLayout, contentMap, tickerDetail } =
    useTickerViewWindowManagerContent(tickerId, isTiling);

  return (
    <TickerContainer tickerId={tickerId}>
      <WindowManager
        onTilingStateChange={setIsTiling}
        initialLayout={initialLayout}
        contentMap={contentMap}
      />
      {tickerDetail && (
        <TickerViewWindowManagerBucketManager tickerDetail={tickerDetail} />
      )}
    </TickerContainer>
  );
}
