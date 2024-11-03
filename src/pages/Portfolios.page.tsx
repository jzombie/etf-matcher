import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";
import FullContainer from "@components/FullContainer";

import usePageTitleSetter from "@hooks/usePageTitleSetter";

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
