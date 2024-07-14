import React from "react";
import BucketList from "@components/BucketList";

import Scrollable from "@layoutKit/Scrollable";

export default function Portfolios() {
  return (
    <Scrollable>
      <BucketList symbolBucketType="watchlist" />
    </Scrollable>
  );
}
