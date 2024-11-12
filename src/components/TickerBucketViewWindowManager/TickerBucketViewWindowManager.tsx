import React, { useState } from "react";

import { TickerBucket } from "@src/store";

import WindowManager from "@components/WindowManager";

import useTickerBucketViewWindowManagerContent from "./hooks/useTickerBucketViewWindowManagerContent";
import TickerSelectionManagerProvider from "./providers/TickerSelectionManagerProvider";

export type TickerBucketViewWindowManagerProps = {
  tickerBucket: TickerBucket;
};

export default function TickerBucketViewWindowManager({
  tickerBucket,
}: TickerBucketViewWindowManagerProps) {
  const [isTiling, setIsTiling] = useState(true);

  const { initialLayout, contentMap } = useTickerBucketViewWindowManagerContent(
    tickerBucket,
    isTiling,
  );

  return (
    <TickerSelectionManagerProvider tickerBucket={tickerBucket}>
      <WindowManager
        onTilingStateChange={setIsTiling}
        initialLayout={initialLayout}
        contentMap={contentMap}
      />
    </TickerSelectionManagerProvider>
  );
}
