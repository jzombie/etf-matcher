import React from "react";

import Euclidean from "./TickerDetail.TickerVectorTable.Euclidean";

export type TickerVectorTableProps = {
  tickerId: number;
};

export default function TickerVectorTable({
  tickerId,
}: TickerVectorTableProps) {
  // TODO: Add ability to switch between `Euclidean Distance` and `Cosine Similarity`
  return <Euclidean tickerId={tickerId} />;
}
