import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import FullContainer from "@components/FullContainer";
import BucketManager from "@components/TickerBucketManager";

import usePageTitleSetter from "@hooks/usePageTitleSetter";

// Note: This is a collection of portfolios; for a specific portfolios, see `TickerBucketPage`
export default function PortfoliosPage() {
  usePageTitleSetter("Portfolios");

  return (
    <Scrollable>
      <FullContainer>
        <BucketManager bucketType="portfolio" />
      </FullContainer>
    </Scrollable>
  );
}
