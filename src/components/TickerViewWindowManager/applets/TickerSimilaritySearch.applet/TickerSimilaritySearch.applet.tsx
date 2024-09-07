import React from "react";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";

import PCAScatterPlot from "@components/PCAScatterPlot";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerSimilaritySearchAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerSimilaritySearchApplet({
  tickerDetail,
}: TickerSimilaritySearchAppletProps) {
  return (
    <Layout>
      <Header>
        <Box sx={{ textAlign: "center", marginBottom: 2 }}>
          <ToggleButtonGroup
            // value={displayMode}
            exclusive
            // onChange={handleDisplayModeChange}
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
        <PCAScatterPlot tickerDetail={tickerDetail} />;
      </Content>
    </Layout>
  );
}
