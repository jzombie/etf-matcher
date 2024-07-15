import React from "react";
import BucketList from "@components/BucketList";

import Scrollable from "@layoutKit/Scrollable";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Watchlists() {
  usePageTitleSetter("Watchlists");

  return (
    <Scrollable>
      <BucketList symbolBucketType="watchlist" />
    </Scrollable>
  );
}
