import React from "react";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Portfolios() {
  usePageTitleSetter("Portfolios");

  return (
    <Scrollable>
      <BucketManager bucketType="portfolio" />
    </Scrollable>
  );
}

// TODO: Make use of persistent session storage for portfolios, with ability to clear data
// TODO: Enable import / export of Portfolios
// TODO: Use Web Share (and Web Share Target [for PWAs]) API as potential transport agent (binary encoding / decoding w/ Base65?)
