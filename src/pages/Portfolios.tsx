import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";
import PortfolioForm from "@components/PortfolioForm";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Portfolios() {
  usePageTitleSetter("Portfolios");

  return (
    <Scrollable>
      {
        // TODO: Finish prototyping and move into `BucketManager`?
      }
      <PortfolioForm />

      <BucketManager bucketType="portfolio" />
    </Scrollable>
  );
}
