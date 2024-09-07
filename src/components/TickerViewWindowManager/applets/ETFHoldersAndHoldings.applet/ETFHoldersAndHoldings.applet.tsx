import React, { useState } from "react";

import { Box, Button } from "@mui/material";

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

  return (
    <Layout>
      <Header>
        <Box sx={{ textAlign: "center" }}>
          <Button
            onClick={() => setDisplayMode("holders")}
            disabled={displayMode === "holders"}
          >
            ETF Holders
          </Button>
          <Button
            onClick={() => setDisplayMode("holdings")}
            disabled={displayMode === "holdings"}
          >
            ETF Holdings
          </Button>
        </Box>
      </Header>
      <Content>
        {displayMode == "holders" ? (
          <ETFHolderList tickerDetail={tickerDetail} />
        ) : (
          <ETFHoldingList etfTickerDetail={tickerDetail} />
        )}
      </Content>
    </Layout>
  );
}
