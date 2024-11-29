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
import Cover from "@layoutKit/Cover";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import {
  RustServiceTickerDetail,
  RustServiceTickerDistance,
} from "@services/RustService";
import { fetchEuclideanByTicker } from "@services/RustService";

import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";
import TickerVectorConfigSelectorDialogModal from "@components/TickerVectorConfigSelectorDialogModal";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import Transition from "@components/Transition";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useElementSize from "@hooks/useElementSize";
import useObjectHash from "@hooks/useObjectHash";
import usePromise from "@hooks/usePromise";
import useTickerVectorConfigs from "@hooks/useTickerVectorConfigs";

import customLogger from "@utils/customLogger";

import TickerViewWindowManagerAppletWrap, {
  TickerViewWindowManagerAppletWrapProps,
} from "../components/TickerViewWindowManager.AppletWrap";

const DISPLAY_MODES = ["radial", "euclidean", "cosine"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

export type TickerSimilaritySearchAppletProps = Omit<
  TickerViewWindowManagerAppletWrapProps,
  "children"
>;

export default function TickerSimilaritySearchApplet({
  tickerDetail,
  missingAuditedTickerVectorIds,
  isTickerVectorAuditPending,
  ...rest
}: TickerSimilaritySearchAppletProps) {
  return (
    <TickerViewWindowManagerAppletWrap
      tickerDetail={tickerDetail}
      missingAuditedTickerVectorIds={missingAuditedTickerVectorIds}
      isTickerVectorAuditPending={isTickerVectorAuditPending}
      {...rest}
    >
      {tickerDetail && (
        <ComponentWrap
          tickerDetail={tickerDetail}
          missingAuditedTickerVectorIds={missingAuditedTickerVectorIds}
          isTickerVectorAuditPending={isTickerVectorAuditPending}
        />
      )}
    </TickerViewWindowManagerAppletWrap>
  );
}

type ComponentWrapProps = {
  tickerDetail: RustServiceTickerDetail;
  missingAuditedTickerVectorIds: TickerSimilaritySearchAppletProps["missingAuditedTickerVectorIds"];
  isTickerVectorAuditPending: TickerSimilaritySearchAppletProps["isTickerVectorAuditPending"];
};

function ComponentWrap({
  tickerDetail,
  missingAuditedTickerVectorIds,
  isTickerVectorAuditPending,
}: ComponentWrapProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("radial");
  const previousModeRef = useRef<DisplayMode>("radial");
  const [
    isTickerVectorConfigSelectorDialogOpen,
    setIsTickerVectorConfigSelectorDialogOpen,
  ] = useState(false);

  const { triggerUIError } = useAppErrorBoundary();

  const {
    preferredTickerVectorConfig,
    preferredTickerVectorConfigKey,
    setPreferredTickerVectorConfig,
  } = useTickerVectorConfigs();

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

  const { data: tickerDistances, execute: fetchTickerDistances } = usePromise<
    RustServiceTickerDistance[],
    [tickerVectorConfigKey: string, tickerId: number]
  >({
    fn: (tickerVectorConfigKey, tickerId) =>
      fetchEuclideanByTicker(tickerVectorConfigKey, tickerId),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not fetch PCA similarity results"));
    },
    initialAutoExecute: false,
  });

  const hashedTickerDistances = useObjectHash(tickerDistances);

  useEffect(() => {
    if (preferredTickerVectorConfigKey && tickerDetail) {
      fetchTickerDistances(
        preferredTickerVectorConfigKey,
        tickerDetail.ticker_id,
      );
    }
  }, [preferredTickerVectorConfigKey, tickerDetail, fetchTickerDistances]);

  return (
    <>
      <Layout>
        {missingAuditedTickerVectorIds?.length ? (
          <Content>
            <Center>
              <NoInformationAvailableAlert>
                Similarity search is not available for &quot;
                {tickerDetail.symbol}&quot;.
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
            <Content ref={setContentElement}>
              {isTickerVectorAuditPending ? (
                <Center>Performing audit...</Center>
              ) : (
                <>
                  {preferredTickerVectorConfigKey && (
                    // Due to some of the child components of the`Transition` wrapper,
                    // it's being conditionally rendered for now.
                    <>
                      <Transition
                        trigger={`${displayMode}-${preferredTickerVectorConfigKey}-${hashedTickerDistances}`}
                        direction={getDirection()}
                      >
                        {displayMode === "radial" ? (
                          <TickerPCAScatterPlot
                            tickerDistances={tickerDistances}
                          />
                        ) : (
                          <Scrollable>
                            <TickerVectorQueryTable
                              queryMode="ticker-detail"
                              query={tickerDetail}
                              alignment={displayMode}
                              tickerVectorConfigKey={
                                preferredTickerVectorConfigKey
                              }
                            />
                          </Scrollable>
                        )}
                      </Transition>
                      {displayMode === "radial" && (
                        <Cover clickThrough>
                          <Layout>
                            <Content>
                              {
                                // Intentionally empty
                                " "
                              }
                            </Content>
                            <Footer>
                              <FooterContent
                                preferredTickerVectorConfigKey={
                                  preferredTickerVectorConfigKey
                                }
                                onOpenTickerVectorConfigSelectorDialog={() =>
                                  setIsTickerVectorConfigSelectorDialogOpen(
                                    true,
                                  )
                                }
                              />
                            </Footer>
                          </Layout>
                        </Cover>
                      )}
                    </>
                  )}
                </>
              )}
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
    </>
  );
}

type FooterContentProps = Omit<BoxProps, "children"> & {
  preferredTickerVectorConfigKey?: string;
  onOpenTickerVectorConfigSelectorDialog: () => void;
};

function FooterContent({
  preferredTickerVectorConfigKey,
  onOpenTickerVectorConfigSelectorDialog,
}: FooterContentProps) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography variant="body2" component="span" sx={{ fontSize: ".8rem" }}>
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
