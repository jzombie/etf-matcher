import React from "react";
import BucketList from "@components/BucketList";
import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";
import BucketManager from "@components/BucketManager";
import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Watchlists() {
  usePageTitleSetter("Watchlists");

  return (
    <Scrollable>
      <Padding>
        <BucketManager />

        <BucketList symbolBucketType="watchlist" />
      </Padding>
    </Scrollable>
  );
}
