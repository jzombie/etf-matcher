import React, { useCallback, useRef, useState } from "react";

import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { RustServiceTickerDetail } from "@services/RustService";

import DialogModal from "@components/DialogModal";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import Transition from "@components/Transition";

import useTicker10KDetail from "@hooks/useTicker10KDetail";

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
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("default");

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

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    handleDialogClose();
  };

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
    return (
      <Center>
        <NoInformationAvailableAlert>
          No current financial information for &quot;{tickerDetail.symbol}&quot;
        </NoInformationAvailableAlert>
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
          <Button onClick={handleDialogOpen} sx={{ ml: 2 }}>
            Select Model
          </Button>
        </Box>
      </Header>
      <Content>
        <Transition trigger={displayMode} direction={getDirection()}>
          {displayMode === "radial" ? (
            <TickerPCAScatterPlot
              // TODO: Don't hardcode the config key
              tickerVectorConfigKey="default"
              tickerDetail={tickerDetail}
            />
          ) : (
            <Scrollable>
              <TickerVectorQueryTable
                queryMode="ticker-detail"
                query={tickerDetail}
                alignment={displayMode}
                tickerVectorConfigKey={selectedModel} // Pass the selected model key
              />
            </Scrollable>
          )}
        </Transition>
      </Content>
      <DialogModal open={isDialogOpen} onClose={handleDialogClose}>
        <Box sx={{ padding: 2 }}>
          <h3>Select a Model</h3>
          <Button onClick={() => handleModelSelect("default")}>
            Default Model
          </Button>
          <Button onClick={() => handleModelSelect("model1")}>Model 1</Button>
          <Button onClick={() => handleModelSelect("model2")}>Model 2</Button>
          {/* Add more models as needed */}
        </Box>
      </DialogModal>
    </Layout>
  );
}
