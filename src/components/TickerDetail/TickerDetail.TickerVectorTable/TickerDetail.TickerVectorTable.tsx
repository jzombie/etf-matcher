import React, { useState } from "react";

import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Padding from "@layoutKit/Padding";
import { RustServiceTickerDetail } from "@src/types";

import Transition from "@components/Transition";

import Cosine from "./TickerDetail.TickerVectorTable.Cosine";
import Euclidean from "./TickerDetail.TickerVectorTable.Euclidean";

export type TickerVectorTableProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerVectorTable({
  tickerDetail,
}: TickerVectorTableProps) {
  const tickerId = tickerDetail.ticker_id;

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
    <Padding>
      <Box sx={{ overflow: "auto" }}>
        <Typography variant="h6" sx={{ float: "left" }}>
          &quot;{tickerDetail.symbol}&quot; Similarity Matches
        </Typography>
        <ToggleButtonGroup
          value={alignment}
          exclusive
          onChange={handleAlignment}
          aria-label="distance metric"
          sx={{ float: "right" }}
          size="small"
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
      </Box>

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
    </Padding>
  );
}
