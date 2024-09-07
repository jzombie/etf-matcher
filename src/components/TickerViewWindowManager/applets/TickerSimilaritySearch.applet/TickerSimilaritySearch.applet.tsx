import React, { useCallback, useRef, useState } from "react";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import PCAScatterPlot from "@components/PCAScatterPlot";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import Transition from "@components/Transition";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerSimilaritySearchAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

const modes = ["radial", "euclidean", "cosine"] as const;
type DisplayMode = (typeof modes)[number];

export default function TickerSimilaritySearchApplet({
  tickerDetail,
}: TickerSimilaritySearchAppletProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("radial");
  const previousModeRef = useRef<DisplayMode>("radial");

  const handleDisplayModeChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newMode: DisplayMode | null) => {
      if (newMode !== null) {
        previousModeRef.current = displayMode; // Store the previous mode
        setDisplayMode(newMode);
      }
    },
    [displayMode],
  );

  const getDirection = useCallback(() => {
    const prevIndex = modes.indexOf(previousModeRef.current);
    const currentIndex = modes.indexOf(displayMode);
    return currentIndex > prevIndex ? "left" : "right";
  }, [displayMode]);

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
        <Transition trigger={displayMode} direction={getDirection()}>
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
        </Transition>
      </Content>
    </Layout>
  );
}
