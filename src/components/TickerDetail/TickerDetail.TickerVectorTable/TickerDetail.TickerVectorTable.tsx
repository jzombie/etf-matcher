import React, { useState } from "react";

import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import Transition from "@components/Transition";

import Cosine from "./TickerDetail.TickerVectorTable.Cosine";
import Euclidean from "./TickerDetail.TickerVectorTable.Euclidean";

export type TickerVectorTableProps = {
  tickerId: number;
};

export default function TickerVectorTable({
  tickerId,
}: TickerVectorTableProps) {
  const [alignment, setAlignment] = useState<"euclidean" | "cosine">(
    "euclidean",
  );

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: "euclidean" | "cosine" | null,
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  return (
    <>
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={handleAlignment}
        aria-label="distance metric"
      >
        <ToggleButton value="euclidean" aria-label="euclidean">
          <StraightenIcon />
          Euclidean
        </ToggleButton>
        <ToggleButton value="cosine" aria-label="cosine">
          <ShowChartIcon />
          Cosine
        </ToggleButton>
      </ToggleButtonGroup>

      <Transition
        trigger={alignment === "euclidean"}
        direction={alignment === "euclidean" ? "right" : "left"}
      >
        {alignment === "euclidean" ? (
          <Euclidean tickerId={tickerId} />
        ) : (
          <Cosine tickerId={tickerId} />
        )}
      </Transition>
    </>
  );
}
