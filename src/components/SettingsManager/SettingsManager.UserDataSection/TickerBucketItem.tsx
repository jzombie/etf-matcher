import React from "react";

import { ButtonBase } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

export type TickerBucketItemProps = {
  tickerBucketTicker: TickerBucketTicker;
};

export default function TickerBucketItem({
  tickerBucketTicker,
}: TickerBucketItemProps) {
  // TODO: Make this clickable
  // TODO: Show logo, etc.
  return <ButtonBase>{tickerBucketTicker.symbol}</ButtonBase>;
}
