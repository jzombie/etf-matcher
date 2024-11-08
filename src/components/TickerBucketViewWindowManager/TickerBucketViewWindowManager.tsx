import React, { useState } from "react";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer } from "@layoutKit/Layout";
import { TickerBucket } from "@src/store";

import WindowManager from "@components/WindowManager";

import useTickerBucketViewWindowManagerContent from "./hooks/useTickerBucketViewWindowManagerContent";

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
    <Full>
      <Layout>
        <Content>
          <WindowManager
            onTilingStateChange={setIsTiling}
            initialLayout={initialLayout}
            contentMap={contentMap}
          />
        </Content>
        <Footer>
          {
            // TODO: Handle accordingly
          }
          TickerBucketViewWindowManager: {tickerBucket.type}:{tickerBucket.name}
        </Footer>
      </Layout>
    </Full>
  );
}
