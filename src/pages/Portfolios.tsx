import React from "react";
import ScrollableBucketList from "@components/ScrollableBucketList";

export default function Portfolios() {
  return <ScrollableBucketList symbolBucketType="portfolio" />;
}

// TODO: Make use of persistent session storage for portfolios, with ability to clear data
// TODO: Enable import / export of Portfolios
// TODO: Use Web Share (and Web Share Target [for PWAs]) API as potential transport agent (binary encoding / decoding w/ Base65?)
