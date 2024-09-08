import React, { useCallback, useRef, useState } from "react";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";

import TickerDetailAppletWrap from "@components/TickerViewWindowManager/components/TickerDetailAppletWrap";
import Transition from "@components/Transition";

import type { RustServiceTickerDetail } from "@utils/callRustService";

import ETFHolderListApplet from "../ETFHolderList.applet";
import ETFHoldingListApplet from "../ETFHoldingList.applet";

export type ETFHoldersAndHoldingsAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
};

const displayModes = ["holders", "holdings"] as const;
type DisplayMode = (typeof displayModes)[number];

export default function ETFHoldersAndHoldingsApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
}: ETFHoldersAndHoldingsAppletProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("holders");
  const previousModeRef = useRef<DisplayMode>("holders");

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
    const prevIndex = displayModes.indexOf(previousModeRef.current);
    const currentIndex = displayModes.indexOf(displayMode);
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
              <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                <ToggleButtonGroup
                  value={displayMode}
                  exclusive
                  onChange={handleDisplayModeChange}
                  aria-label="ETF holders and holdings toggle"
                  size="small"
                >
                  <ToggleButton value="holders" aria-label="ETF holders">
                    ETF Holders
                  </ToggleButton>
                  <ToggleButton value="holdings" aria-label="ETF holdings">
                    ETF Holdings
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Header>
            <Content>
              <Transition trigger={displayMode} direction={getDirection()}>
                {displayMode === "holders" ? (
                  <ETFHolderListApplet tickerDetail={tickerDetail} />
                ) : (
                  <ETFHoldingListApplet etfTickerDetail={tickerDetail} />
                )}
              </Transition>
            </Content>
          </Layout>
        )}
      </>
    </TickerDetailAppletWrap>
  );
}
