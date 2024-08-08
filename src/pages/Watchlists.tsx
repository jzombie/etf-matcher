import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Watchlists() {
  usePageTitleSetter("Watchlists");

  return (
    <Scrollable>
      <BucketManager bucketType="watchlist" />
    </Scrollable>
  );
}
