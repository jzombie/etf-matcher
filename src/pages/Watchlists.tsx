import React from "react";
import BucketList from "@components/BucketList";

import Scrollable from "@layoutKit/Scrollable";

export default function Watchlists() {
  return (
    <Scrollable>
      <BucketList symbolBucketType="watchlist" />
    </Scrollable>
  );
}
