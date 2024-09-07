import React, { useCallback, useState } from "react";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import PCAScatterPlot from "@components/PCAScatterPlot";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerSimilaritySearchAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerSimilaritySearchApplet({
  tickerDetail,
}: TickerSimilaritySearchAppletProps) {
  const [displayMode, setDisplayMode] = useState<
    "radial" | "euclidean" | "cosine"
  >("radial");

  const handleDisplayModeChange = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      newMode: "radial" | "euclidean" | "cosine" | null,
    ) => {
      if (newMode !== null) {
        setDisplayMode(newMode);
      }
    },
    [],
  );

  return (
    <Layout>
      <Header>
        <Box sx={{ textAlign: "center", marginBottom: 2 }}>
          <ToggleButtonGroup
            value={displayMode}
            exclusive
            onChange={handleDisplayModeChange}
            aria-label="Similarity search toggle"
            size="small"
          >
            <ToggleButton value="radial" aria-label="Radial chart">
              Radial
            </ToggleButton>
            <ToggleButton value="euclidean" aria-label="Euclidean">
              Euclidean
            </ToggleButton>
            <ToggleButton value="cosine" aria-label="Cosine">
              Cosine
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Header>
      <Content>
        {displayMode === "radial" ? (
          <PCAScatterPlot tickerDetail={tickerDetail} />
        ) : (
          <Scrollable>
            <TickerVectorQueryTable
              queryMode="ticker-detail"
              query={tickerDetail}
              alignment={displayMode}
            />
          </Scrollable>
        )}
      </Content>
    </Layout>
  );
}
