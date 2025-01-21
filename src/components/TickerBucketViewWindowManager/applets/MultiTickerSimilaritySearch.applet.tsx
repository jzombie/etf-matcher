import React, { useCallback, useEffect, useRef, useState } from "react";

import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Box,
  BoxProps,
  IconButton,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { fetchEuclideanByTickerBucket } from "@services/RustService";
import { RustServiceTickerDistance } from "@services/RustService";
import { TickerBucket } from "@src/store";

import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
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
  ...rest
}: MultiTickerSimilaritySearchAppletProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const [
    isTickerVectorConfigSelectorDialogOpen,
    setIsTickerVectorConfigSelectorDialogOpen,
  ] = useState(false);

  const {
    filteredTickerBucket,
    missingAuditedTickerSymbols,
    isTickerVectorAuditPending,
  } = useTickerSelectionManagerContext();

  const {
    preferredTickerVectorConfigKey,
    preferredTickerVectorConfig,
    setPreferredTickerVectorConfig,
  } = useTickerVectorConfigs();

  // TODO: Should this be based on cosine instead, or at least configurable?
  const { data: tickerDistances, execute: fetchTickerDistances } = usePromise<
    RustServiceTickerDistance[],
    [tickerVectorConfigKey: string, filteredTickerBucket: TickerBucket]
  >({
    fn: (tickerVectorConfigKey, filteredTickerBucket) =>
      fetchEuclideanByTickerBucket(tickerVectorConfigKey, filteredTickerBucket),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not fetch PCA similarity results"));
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (preferredTickerVectorConfigKey && filteredTickerBucket) {
      fetchTickerDistances(
        preferredTickerVectorConfigKey,
        filteredTickerBucket,
      );
    }
  }, [
    preferredTickerVectorConfigKey,
    filteredTickerBucket,
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

  // TODO: Handle (used for `Transition` view direction)
  // const getDirection = useCallback(() => {
  //   const prevIndex = DISPLAY_MODES.indexOf(previousModeRef.current);
  //   const currentIndex = DISPLAY_MODES.indexOf(displayMode);
  //   return currentIndex > prevIndex ? "left" : "right";
  // }, [displayMode]);

  // TODO: Remove hardcoding
  const shouldShowLabels = true;

  if (!preferredTickerVectorConfigKey) {
    return null;
  }

  return (
    <TickerBucketViewWindowManagerAppletWrap {...rest}>
      <Layout>
        {missingAuditedTickerSymbols?.length ? (
          <Content>
            <Center>
              <NoInformationAvailableAlert>
                {missingAuditedTickerSymbols.length} ticker
                {missingAuditedTickerSymbols.length !== 1 ? "s" : ""}{" "}
                {missingAuditedTickerSymbols.length !== 1 ? "are" : "is"}{" "}
                preventing similarity search (model:{" "}
                {preferredTickerVectorConfigKey}).
              </NoInformationAvailableAlert>
            </Center>
          </Content>
        ) : (
          <>
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
                  <ToggleButton
                    value="cosine"
                    aria-label="Cosine"
                    title="Cosine"
                  >
                    <ShowChartIcon sx={{ mr: 0.5 }} />
                    {shouldShowLabels && "Cosine"}
                  </ToggleButton>
                </ToggleButtonGroup>
                <IconButton
                  onClick={() =>
                    setIsTickerVectorConfigSelectorDialogOpen(true)
                  }
                  aria-label="Select Model"
                  sx={{ ml: 1, mt: -3 }}
                >
                  <SettingsIcon />
                </IconButton>
              </Box>
            </Header>
            <Content>
              {isTickerVectorAuditPending ? (
                <Center>Performing audit...</Center>
              ) : (
                <>
                  {displayMode === "radial" ? (
                    <TickerPCAScatterPlot tickerDistances={tickerDistances} />
                  ) : (
                    <Scrollable>
                      <TickerVectorQueryTable
                        queryMode="bucket"
                        query={filteredTickerBucket}
                        alignment={displayMode}
                        tickerVectorConfigKey={preferredTickerVectorConfigKey}
                      />
                    </Scrollable>
                  )}

                  {displayMode === "radial" && (
                    <FooterContent
                      preferredTickerVectorConfigKey={
                        preferredTickerVectorConfigKey
                      }
                      onOpenTickerVectorConfigSelectorDialog={() =>
                        setIsTickerVectorConfigSelectorDialogOpen(true)
                      }
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                      }}
                    />
                  )}
                </>
              )}
              {
                // TODO: Finish adding other similarity search components
              }
            </Content>
          </>
        )}

        <Footer>
          {displayMode !== "radial" && (
            <FooterContent
              preferredTickerVectorConfigKey={preferredTickerVectorConfigKey}
              onOpenTickerVectorConfigSelectorDialog={() =>
                setIsTickerVectorConfigSelectorDialogOpen(true)
              }
            />
          )}
        </Footer>
      </Layout>

      {preferredTickerVectorConfig && (
        <TickerVectorConfigSelectorDialogModal
          open={isTickerVectorConfigSelectorDialogOpen}
          onClose={() => setIsTickerVectorConfigSelectorDialogOpen(false)}
          selectedConfig={preferredTickerVectorConfig}
          onSelect={setPreferredTickerVectorConfig}
        />
      )}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}

type FooterContentProps = Omit<BoxProps, "children"> & {
  preferredTickerVectorConfigKey?: string;
  onOpenTickerVectorConfigSelectorDialog: () => void;
};

function FooterContent({
  preferredTickerVectorConfigKey,
  onOpenTickerVectorConfigSelectorDialog,
  sx = {},
  ...rest
}: FooterContentProps) {
  return (
    <Box sx={{ textAlign: "right", ...sx }} {...rest}>
      <Typography variant="body2" component="span">
        Using model:{" "}
        <Link
          component="button"
          variant="body2"
          onClick={onOpenTickerVectorConfigSelectorDialog}
          sx={{ cursor: "pointer", color: "text.secondary" }}
        >
          {preferredTickerVectorConfigKey || "N/A"}
        </Link>
      </Typography>
    </Box>
  );
}
