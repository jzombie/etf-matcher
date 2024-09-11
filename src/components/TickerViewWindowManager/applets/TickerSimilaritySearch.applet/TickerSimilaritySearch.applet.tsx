import React, { useCallback, useRef, useState } from "react";

import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import { Alert, Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import PCAScatterPlot from "@components/PCAScatterPlot";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import Transition from "@components/Transition";

import useTicker10KDetail from "@hooks/useTicker10KDetail";

import { RustServiceTickerDetail } from "@utils/callRustService";

import TickerDetailAppletWrap from "../../components/TickerDetailAppletWrap";

const DISPLAY_MODES = ["radial", "euclidean", "cosine"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

export type TickerSimilaritySearchAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  isTiling: boolean;
};

export default function TickerSimilaritySearchApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  isTiling,
}: TickerSimilaritySearchAppletProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      isTiling={isTiling}
    >
      {tickerDetail && <ComponentWrap tickerDetail={tickerDetail} />}
    </TickerDetailAppletWrap>
  );
}

type ComponentWrapProps = {
  tickerDetail: RustServiceTickerDetail;
};

function ComponentWrap({ tickerDetail }: ComponentWrapProps) {
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

  // TODO: Handle error state
  const { isLoading: isLoadingFinancialDetail, detail: financialDetail } =
    useTicker10KDetail(tickerDetail.ticker_id, tickerDetail.is_etf);

  if (isLoadingFinancialDetail) {
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (!financialDetail?.are_financials_current) {
    {
      // TODO: Unify all `no information available` into a common component
    }
    return (
      <Center>
        <Alert severity="warning">
          No current financial information for &quot;{tickerDetail.symbol}&quot;
        </Alert>
      </Center>
    );
  }

  return (
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
            <ToggleButton value="radial" aria-label="Radial chart">
              <DonutLargeIcon sx={{ mr: 0.5 }} />
              Radial
            </ToggleButton>
            <ToggleButton value="euclidean" aria-label="Euclidean">
              <StraightenIcon sx={{ mr: 0.5 }} />
              Euclidean
            </ToggleButton>
            <ToggleButton value="cosine" aria-label="Cosine">
              <ShowChartIcon sx={{ mr: 0.5 }} />
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
