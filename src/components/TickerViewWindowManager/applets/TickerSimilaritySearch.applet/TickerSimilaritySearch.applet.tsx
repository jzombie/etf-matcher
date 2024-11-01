import React, { useCallback, useEffect, useRef, useState } from "react";

import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Box,
  IconButton,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import {
  RustServiceTickerDetail,
  RustServiceTickerVectorConfig,
} from "@services/RustService";
import { DEFAULT_TICKER_VECTOR_CONFIG_KEY } from "@src/constants";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";
import TickerVectorConfigSelectorDialogModal from "@components/TickerVectorConfigSelectorDialogModal";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import Transition from "@components/Transition";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useElementSize from "@hooks/useElementSize";
import useTicker10KDetail from "@hooks/useTicker10KDetail";
import useTickerVectorConfigs from "@hooks/useTickerVectorConfigs";

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

  const [selectedModelConfig, _setSelectedModelConfig] =
    useState<RustServiceTickerVectorConfig | null>(null);

  const tickerVectorConfigs = useTickerVectorConfigs();

  const { triggerUIError } = useAppErrorBoundary();

  useEffect(() => {
    if (!selectedModelConfig && tickerVectorConfigs.length > 0) {
      const defaultConfig = tickerVectorConfigs.find(
        (config) => config.key === DEFAULT_TICKER_VECTOR_CONFIG_KEY,
      ) as RustServiceTickerVectorConfig;

      if (defaultConfig) {
        _setSelectedModelConfig(defaultConfig);
      } else {
        triggerUIError(new Error("No default model configuration found"));
      }
    }
  }, [tickerVectorConfigs, selectedModelConfig, triggerUIError]);

  const handleSelectModelConfig = useCallback(
    (selectedModelConfig: RustServiceTickerVectorConfig) => {
      // Set the key
      _setSelectedModelConfig(selectedModelConfig);

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

  // Using `useState` for `contentElement` to ensure it triggers a re-render
  // when the element is set, allowing `useElementSize` to update immediately.
  //
  // This fixes a bug where the labels were not immediately shown, and would only
  // show after the component had re-rendered.
  const [contentElement, setContentElement] = useState<HTMLElement | null>(
    null,
  );
  const contentSize = useElementSize(contentElement);

  const shouldShowLabels = contentSize.width >= 360;

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
        <Box sx={{ textAlign: "center" }}>
          <ToggleButtonGroup
            value={displayMode}
            exclusive
            onChange={handleDisplayModeChange}
            aria-label="Similarity search toggle"
            size="small"
          >
            <ToggleButton
              value="radial"
              aria-label="Radial chart"
              title="Radial chart"
            >
              <DonutLargeIcon sx={{ mr: 0.5 }} />
              {shouldShowLabels && "Radial"}
            </ToggleButton>
            <ToggleButton
              value="euclidean"
              aria-label="Euclidean"
              title="Euclidean"
            >
              <StraightenIcon sx={{ mr: 0.5 }} />
              {shouldShowLabels && "Euclidean"}
            </ToggleButton>
            <ToggleButton value="cosine" aria-label="Cosine" title="Cosine">
              <ShowChartIcon sx={{ mr: 0.5 }} />
              {shouldShowLabels && "Cosine"}
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
      <Content ref={setContentElement}>
        {selectedModelConfig && (
          <Transition
            trigger={`${displayMode}-${selectedModelConfig.key}`}
            direction={getDirection()}
          >
            {displayMode === "radial" ? (
              <TickerPCAScatterPlot
                tickerVectorConfigKey={selectedModelConfig.key}
                tickerDetail={tickerDetail}
              />
            ) : (
              <Scrollable>
                <TickerVectorQueryTable
                  queryMode="ticker-detail"
                  query={tickerDetail}
                  alignment={displayMode}
                  tickerVectorConfigKey={selectedModelConfig.key}
                />
              </Scrollable>
            )}
          </Transition>
        )}
      </Content>
      <Footer style={{ textAlign: "right" }}>
        <Typography variant="body2" component="span" sx={{ fontSize: ".8rem" }}>
          Using model:{" "}
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsTickerVectorConfigSelectorDialogOpen(true)}
            sx={{ cursor: "pointer", color: "text.secondary" }}
          >
            {selectedModelConfig?.key || "N/A"}
          </Link>
        </Typography>
      </Footer>
      {selectedModelConfig && (
        <TickerVectorConfigSelectorDialogModal
          open={isTickerVectorConfigSelectorDialogOpen}
          onClose={() => setIsTickerVectorConfigSelectorDialogOpen(false)}
          selectedConfig={selectedModelConfig}
          onSelect={handleSelectModelConfig}
        />
      )}
    </Layout>
  );
}
