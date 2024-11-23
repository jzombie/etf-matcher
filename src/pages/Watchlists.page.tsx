import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";
import FullContainer from "@components/FullContainer";

import usePageTitleSetter from "@hooks/usePageTitleSetter";

// Note: This is a collection of watchlists; for a specific watchlist, see `TickerBucketPage`
export default function WatchlistsPage() {
  usePageTitleSetter("Watchlists");

  return (
    <Scrollable>
      <FullContainer>
        <BucketManager bucketType="watchlist" />
      </FullContainer>
    </Scrollable>
  );
}
