import React from "react";
import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";
import BucketManager from "@components/BucketManager";
import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Watchlists() {
  usePageTitleSetter("Watchlists");

  return (
    <Scrollable>
      <Padding>
        <BucketManager bucketType="watchlist" />
      </Padding>
    </Scrollable>
  );
}
