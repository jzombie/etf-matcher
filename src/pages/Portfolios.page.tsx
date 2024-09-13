import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function PortfoliosPage() {
  usePageTitleSetter("Portfolios");

  return (
    <Scrollable>
      <BucketManager bucketType="portfolio" />
    </Scrollable>
  );
}
