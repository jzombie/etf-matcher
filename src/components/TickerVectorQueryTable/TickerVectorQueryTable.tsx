import React from "react";

// import ShowChartIcon from "@mui/icons-material/ShowChart";
// import StraightenIcon from "@mui/icons-material/Straighten";
// import {
//   Box,
//   ToggleButton,
//   ToggleButtonGroup,
//   Typography,
// } from "@mui/material";
// import Padding from "@layoutKit/Padding";
import Transition from "@components/Transition";

import { TickerVectorQueryProps } from "@hooks/useTickerVectorQuery";

import Cosine from "./TickerVectorQueryTable.Cosine";
import Euclidean from "./TickerVectorQueryTable.Euclidean";

export type VectorSimiliartyTableProps = {
  queryMode: TickerVectorQueryProps["queryMode"];
  query: TickerVectorQueryProps["query"];
  alignment: "euclidean" | "cosine";
};

export default function TickerVectorQueryTable({
  queryMode,
  query,
  alignment,
}: VectorSimiliartyTableProps) {
  // const { queryName } = useTickerVectorQuery({
  //   queryMode,
  //   query,
  // });

  // const [alignment, setAlignment] = useState<"euclidean" | "cosine">(
  //   "euclidean",
  // );

  // const handleAlignment = (
  //   event: React.MouseEvent<HTMLElement>,
  //   newAlignment: "euclidean" | "cosine" | null,
  // ) => {
  //   if (newAlignment !== null) {
  //     setAlignment(newAlignment);
  //   }
  // };

  return (
    <>
      {/* <Box sx={{ overflow: "auto" }}>
        <Typography variant="h6">
          &quot;{queryName}&quot; Similarity Matches
        </Typography>
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          Note: Similarity matches are based on 10 years of financial data from
          10-K statements. For ETFs, we use weighted averages of these
          statements. The data is analyzed and compared using machine learning
          and linear algebra techniques to help you find the most similar
          investments.
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
      </Box> */}

      <Transition
        trigger={alignment === "euclidean"}
        direction={alignment === "euclidean" ? "right" : "left"}
      >
        {alignment === "euclidean" ? (
          <Euclidean queryMode={queryMode} query={query} />
        ) : (
          <Cosine queryMode={queryMode} query={query} />
        )}
      </Transition>
    </>
  );
}
