import React, { useCallback, useEffect, useRef, useState } from "react";

import BusinessIcon from "@mui/icons-material/Business";
import LayersIcon from "@mui/icons-material/Layers";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";

import Transition from "@components/Transition";

import TickerViewWindowManagerAppletWrap, {
  TickerViewWindowManagerAppletWrapProps,
} from "../../components/TickerViewWindowManager.AppletWrap";
import ETFHolderSelectableGrid from "./ETFHolderSelectableGrid";
import ETFHoldingSelectableGrid from "./ETFHoldingSelectableGrid";

const DISPLAY_MODES = ["holders", "holdings"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

export type ETFHoldersAndHoldingsAppletProps = Omit<
  TickerViewWindowManagerAppletWrapProps,
  "children"
>;

export default function ETFHoldersAndHoldingsApplet({
  tickerDetail,
  ...rest
}: ETFHoldersAndHoldingsAppletProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("holders");
  const previousDisplayModeRef = useRef<DisplayMode>("holders");
  const [hasProcessedDynamicDisplayMode, setHasProcessedDynamicDisplayMode] =
    useState<boolean>(false);

  // Handle dynamic setting of display mode.
  // Note: This is not predetermined in `useState`'s default because `tickerDetail`
  // may not be immediately avaialble when this component is first rendered.
  useEffect(() => {
    if (tickerDetail?.is_etf) {
      setDisplayMode("holdings");
    } else {
      setDisplayMode("holders");
    }

    setHasProcessedDynamicDisplayMode(true);
  }, [tickerDetail]);

  const handleDisplayModeChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newMode: DisplayMode | null) => {
      if (newMode !== null) {
        previousDisplayModeRef.current = displayMode; // Store the previous mode
        setDisplayMode(newMode);
      }
    },
    [displayMode],
  );

  const getDirection = useCallback(() => {
    const prevIndex = DISPLAY_MODES.indexOf(previousDisplayModeRef.current);
    const currentIndex = DISPLAY_MODES.indexOf(displayMode);
    return currentIndex > prevIndex ? "left" : "right";
  }, [displayMode]);

  // Help prevent potential performance issues if intially trying to render the
  // non-optimal display mode, by helping reduce unecessary network requests
  if (!hasProcessedDynamicDisplayMode) {
    return null;
  }

  return (
    <TickerViewWindowManagerAppletWrap tickerDetail={tickerDetail} {...rest}>
      <>
        {tickerDetail && (
          <Layout>
            <Header>
              <Box sx={{ textAlign: "center", marginBottom: 1 }}>
                <ToggleButtonGroup
                  value={displayMode}
                  exclusive
                  onChange={handleDisplayModeChange}
                  aria-label="ETF holders and holdings toggle"
                  size="small"
                >
                  <ToggleButton value="holders" aria-label="ETF holders">
                    <LayersIcon sx={{ mr: 0.5 }} />
                    ETF Holders
                  </ToggleButton>
                  <ToggleButton value="holdings" aria-label="ETF holdings">
                    <BusinessIcon sx={{ mr: 0.5 }} />
                    ETF Holdings
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Header>
            <Content>
              <Transition trigger={displayMode} direction={getDirection()}>
                {displayMode === "holders" ? (
                  <ETFHolderSelectableGrid tickerDetail={tickerDetail} />
                ) : (
                  <ETFHoldingSelectableGrid etfTickerDetail={tickerDetail} />
                )}
              </Transition>
            </Content>
          </Layout>
        )}
      </>
    </TickerViewWindowManagerAppletWrap>
  );
}
