import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import FullContainer from "@components/FullContainer";
import TickerBucketManager from "@components/TickerBucketManager";

import usePageTitleSetter from "@hooks/usePageTitleSetter";

// Note: This is a collection of portfolios; for a specific portfolios, see `TickerBucketPage`
export default function PortfoliosPage() {
  usePageTitleSetter("Portfolios");

  return (
    <Scrollable>
      <FullContainer>
        <TickerBucketManager bucketType="portfolio" />
      </FullContainer>
    </Scrollable>
  );
}
