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

import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { fetchEuclideanByTickerBucket } from "@services/RustService";
import { RustServiceTickerDistance } from "@services/RustService";
import { TickerBucket } from "@src/store";

import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";
import TickerVectorConfigSelectorDialogModal from "@components/TickerVectorConfigSelectorDialogModal";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePromise from "@hooks/usePromise";
import useTickerVectorConfigs from "@hooks/useTickerVectorConfigs";

import customLogger from "@utils/customLogger";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerSimilaritySearchAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

const DISPLAY_MODES = ["radial", "euclidean", "cosine"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

export default function MultiTickerSimilaritySearchApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerSimilaritySearchAppletProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const [
    isTickerVectorConfigSelectorDialogOpen,
    setIsTickerVectorConfigSelectorDialogOpen,
  ] = useState(false);

  const { adjustedTickerBucket } = useTickerSelectionManagerContext();

  const {
    preferredTickerVectorConfigKey,
    preferredTickerVectorConfig,
    setPreferredTickerVectorConfig,
  } = useTickerVectorConfigs();

  const { data: tickerDistances, execute: fetchTickerDistances } = usePromise<
    RustServiceTickerDistance[],
    [tickerVectorConfigKey: string, adjustedTickerBucket: TickerBucket]
  >({
    fn: (tickerVectorConfigKey, adjustedTickerBucket) =>
      fetchEuclideanByTickerBucket(tickerVectorConfigKey, adjustedTickerBucket),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not fetch PCA similarity results"));
    },
    autoExecute: false,
  });

  useEffect(() => {
    if (preferredTickerVectorConfigKey && adjustedTickerBucket) {
      fetchTickerDistances(
        preferredTickerVectorConfigKey,
        adjustedTickerBucket,
      );
    }
  }, [
    preferredTickerVectorConfigKey,
    adjustedTickerBucket,
    fetchTickerDistances,
  ]);

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

  // TODO: Remove hardcoding
  const shouldShowLabels = true;

  if (!preferredTickerVectorConfigKey) {
    return null;
  }

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
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
        <Content>
          {
            // TODO: Finish adding other similarity search components
          }
          {displayMode === "radial" ? (
            <TickerPCAScatterPlot tickerDistances={tickerDistances} />
          ) : (
            <Scrollable>
              <TickerVectorQueryTable
                queryMode="bucket"
                query={adjustedTickerBucket}
                alignment={displayMode}
                tickerVectorConfigKey={preferredTickerVectorConfigKey}
              />
            </Scrollable>
          )}
        </Content>
        <Footer>
          <Footer style={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontSize: ".8rem" }}
            >
              Using model:{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => setIsTickerVectorConfigSelectorDialogOpen(true)}
                sx={{ cursor: "pointer", color: "text.secondary" }}
              >
                {preferredTickerVectorConfigKey || "N/A"}
              </Link>
            </Typography>
          </Footer>
        </Footer>
        {preferredTickerVectorConfig && (
          <TickerVectorConfigSelectorDialogModal
            open={isTickerVectorConfigSelectorDialogOpen}
            onClose={() => setIsTickerVectorConfigSelectorDialogOpen(false)}
            selectedConfig={preferredTickerVectorConfig}
            onSelect={setPreferredTickerVectorConfig}
          />
        )}
      </Layout>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
