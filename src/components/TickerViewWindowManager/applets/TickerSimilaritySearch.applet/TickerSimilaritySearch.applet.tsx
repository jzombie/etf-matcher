import React, { useCallback, useRef, useState } from "react";

import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { RustServiceTickerDetail } from "@services/RustService";
import { DEFAULT_TICKER_VECTOR_CONFIG_KEY } from "@src/constants";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";
import TickerVectorConfigSelectorDialogModal from "@components/TickerVectorConfigSelectorDialogModal";
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
  const [
    isTickerVectorConfigSelectorDialogOpen,
    setIsTickerVectorConfigSelectorDialogOpen,
  ] = useState(false);

  const [selectedModelConfigKey, _setSelectedModelConfigKey] = useState<string>(
    DEFAULT_TICKER_VECTOR_CONFIG_KEY,
  );

  const handleSelectModelConfig = useCallback(
    (selectedModelConfigKey: string) => {
      // Set the key
      _setSelectedModelConfigKey(selectedModelConfigKey);

      // Close the dialog
      setIsTickerVectorConfigSelectorDialogOpen(false);
    },
    [],
  );

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

  // const handleModelSelect = (model: string) => {
  //   setSelectedModel(model);
  //   handleDialogClose();
  // };

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
            {
              // TODO: Hide labels if the applet is too narrow
            }
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
          <IconButton
            onClick={() => setIsTickerVectorConfigSelectorDialogOpen(true)}
            aria-label="Select Model"
            sx={{ ml: 1, mb: 1 }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Header>
      <Content>
        <Transition trigger={displayMode} direction={getDirection()}>
          {displayMode === "radial" ? (
            <TickerPCAScatterPlot
              tickerVectorConfigKey={selectedModelConfigKey}
              tickerDetail={tickerDetail}
            />
          ) : (
            <Scrollable>
              <TickerVectorQueryTable
                queryMode="ticker-detail"
                query={tickerDetail}
                alignment={displayMode}
                tickerVectorConfigKey={selectedModelConfigKey}
              />
            </Scrollable>
          )}
        </Transition>
      </Content>
      <TickerVectorConfigSelectorDialogModal
        open={isTickerVectorConfigSelectorDialogOpen}
        onClose={() => setIsTickerVectorConfigSelectorDialogOpen(false)}
        selectedConfigKey={selectedModelConfigKey}
        onSelect={handleSelectModelConfig}
      />
    </Layout>
  );
}
