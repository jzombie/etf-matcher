import React, { useState } from "react";

import { Button } from "@mui/material";

import type { TickerBucket } from "@src/store";

import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import BucketTicker from "./BucketManager.Bucket.Ticker";

export type TickerBucketProps = {
  tickerBucket: TickerBucket;
};

export default function TickerBucketView({ tickerBucket }: TickerBucketProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div>
      {/* Toggle button for collapse/expand */}
      <Button onClick={toggleCollapse} disabled={!tickerBucket.tickers.length}>
        {isCollapsed ? "Expand" : "Collapse"} List
      </Button>

      <div>
        {!isCollapsed && (
          <UnstyledUL>
            {tickerBucket.tickers.map((bucketTicker) => (
              <UnstyledLI key={bucketTicker.tickerId}>
                <BucketTicker bucketTicker={bucketTicker} />
              </UnstyledLI>
            ))}
          </UnstyledUL>
        )}
      </div>
    </div>
  );
}
