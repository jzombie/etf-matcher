import React, { useState } from "react";

import { TickerBucket } from "@src/store";

import WindowManager from "@components/WindowManager";

import useTickerBucketViewWindowManagerContent from "./hooks/useTickerBucketViewWindowManagerContent";
import WindowManagerContentProvider from "./providers/TickerBucketViewWindowManager.ContentProvider";

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
    // TODO: Rename this provider; it seems to overlap in name with the `useTickerBucketViewWindowManagerContent` hook
    <WindowManagerContentProvider tickerBucket={tickerBucket}>
      <WindowManager
        onTilingStateChange={setIsTiling}
        initialLayout={initialLayout}
        contentMap={contentMap}
      />
    </WindowManagerContentProvider>
  );
}
