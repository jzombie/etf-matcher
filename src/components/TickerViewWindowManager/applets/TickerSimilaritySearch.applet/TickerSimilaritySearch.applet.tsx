import React, { useCallback, useRef, useState } from "react";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import PCAScatterPlot from "@components/PCAScatterPlot";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import Transition from "@components/Transition";

import { RustServiceTickerDetail } from "@utils/callRustService";

import TickerDetailAppletWrap from "../../components/TickerDetailAppletWrap";

const DISPLAY_MODES = ["radial", "euclidean", "cosine"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

export type TickerSimilaritySearchAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
};

export default function TickerSimilaritySearchApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
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
    const prevIndex = DISPLAY_MODES.indexOf(previousModeRef.current);
    const currentIndex = DISPLAY_MODES.indexOf(displayMode);
    return currentIndex > prevIndex ? "left" : "right";
  }, [displayMode]);

  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
    >
      <>
        {tickerDetail && (
          <Layout>
            <Header>
              <Box sx={{ textAlign: "center", marginBottom: 1 }}>
                <ToggleButtonGroup
                  value={displayMode}
                  exclusive
                  onChange={handleDisplayModeChange}
                  aria-label="Similarity search toggle"
                  size="small"
                >
                  {
                    // TODO: Reintroduce icons
                  }
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
        )}
      </>
    </TickerDetailAppletWrap>
  );
}
