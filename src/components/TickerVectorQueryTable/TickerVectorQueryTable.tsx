import React from "react";

import Transition from "@components/Transition";

import { TickerVectorQueryProps } from "@hooks/useTickerVectorQuery";

import Cosine from "./TickerVectorQueryTable.Cosine";
import Euclidean from "./TickerVectorQueryTable.Euclidean";

export type VectorSimiliartyTableProps = {
  tickerVectorConfigKey: string;
  queryMode: TickerVectorQueryProps["queryMode"];
  query: TickerVectorQueryProps["query"];
  alignment: "euclidean" | "cosine";
};

export default function TickerVectorQueryTable({
  tickerVectorConfigKey,
  queryMode,
  query,
  alignment,
}: VectorSimiliartyTableProps) {
  return (
    <Transition
      trigger={alignment === "euclidean"}
      direction={alignment === "euclidean" ? "right" : "left"}
    >
      {alignment === "euclidean" ? (
        <Euclidean
          tickerVectorConfigKey={tickerVectorConfigKey}
          queryMode={queryMode}
          query={query}
        />
      ) : (
        <Cosine
          tickerVectorConfigKey={tickerVectorConfigKey}
          queryMode={queryMode}
          query={query}
        />
      )}
    </Transition>
  );
}
