import React, { useState } from "react";

import { Button } from "@mui/material";

import Cosine from "./TickerDetail.TickerVectorTable.Cosine";
import Euclidean from "./TickerDetail.TickerVectorTable.Euclidean";

export type TickerVectorTableProps = {
  tickerId: number;
};

export default function TickerVectorTable({
  tickerId,
}: TickerVectorTableProps) {
  const [isEuclidean, setIsEuclidean] = useState(true);

  return (
    <>
      {
        // TODO: Improve switch componentry
      }
      <Button onClick={() => setIsEuclidean(true)} disabled={isEuclidean}>
        Euclidean
      </Button>
      <Button onClick={() => setIsEuclidean(false)} disabled={!isEuclidean}>
        Cosine
      </Button>

      {
        // TODO: Use `Transition` view?
      }
      <div>
        {isEuclidean ? (
          <Euclidean tickerId={tickerId} />
        ) : (
          <Cosine tickerId={tickerId} />
        )}
      </div>
    </>
  );
}
