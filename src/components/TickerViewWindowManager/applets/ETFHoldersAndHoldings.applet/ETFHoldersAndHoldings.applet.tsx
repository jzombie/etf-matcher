import React, { useCallback, useState } from "react";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";

import type { RustServiceTickerDetail } from "@utils/callRustService";

import ETFHolderList from "../ETFHolderList.applet";
import ETFHoldingList from "../ETFHoldingList.applet";

export type ETFHoldersAndHoldingsProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function ETFHoldersAndHoldings({
  tickerDetail,
}: ETFHoldersAndHoldingsProps) {
  const [displayMode, setDisplayMode] = useState<"holders" | "holdings">(
    "holders",
  );

  const handleDisplayModeChange = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      newMode: "holders" | "holdings" | null,
    ) => {
      if (newMode !== null) {
        setDisplayMode(newMode);
      }
    },
    [],
  );

  return (
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
        {displayMode === "holders" ? (
          <ETFHolderList tickerDetail={tickerDetail} />
        ) : (
          <ETFHoldingList etfTickerDetail={tickerDetail} />
        )}
      </Content>
    </Layout>
  );
}
