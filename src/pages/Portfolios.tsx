import React from "react";
import BucketList from "@components/BucketList";

import Scrollable from "@layoutKit/Scrollable";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Portfolios() {
  usePageTitleSetter("Portfolios");

  return (
    <Scrollable>
      <BucketList symbolBucketType="portfolio" />
    </Scrollable>
  );
}

// TODO: Make use of persistent session storage for portfolios, with ability to clear data
// TODO: Enable import / export of Portfolios
// TODO: Use Web Share (and Web Share Target [for PWAs]) API as potential transport agent (binary encoding / decoding w/ Base65?)
