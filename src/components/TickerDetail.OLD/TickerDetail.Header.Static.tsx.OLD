import React from "react";

import { Box, ButtonBase } from "@mui/material";

import AvatarLogo from "@components/AvatarLogo";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import type { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerDetailStaticHeaderProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerDetailStaticHeader({
  tickerDetail,
}: TickerDetailStaticHeaderProps) {
  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        // Apply a gradient fade-out so the static header doesn't appear to overlay the scrollbar
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,.7) 80%, rgba(0,0,0,0) 100%)",
        padding: 1,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <ButtonBase
        sx={{ width: "100%", overflow: "hidden" }}
        onClick={() => navigateToSymbol(tickerDetail.symbol)}
      >
        <AvatarLogo
          tickerDetail={tickerDetail}
          style={{
            verticalAlign: "middle",
            marginRight: 8,
            flexShrink: 0,
          }}
        />
        <h3
          style={{
            display: "inline-block",
            textAlign: "left",
            margin: 0,
            padding: 0,
            whiteSpace: "nowrap", // Prevent text from wrapping to the next line
            overflow: "hidden", // Hide overflowing content
            textOverflow: "ellipsis", // Show ellipsis for overflowing text
            flexGrow: 1, // Allow the text to take up available space
          }}
        >
          {tickerDetail.company_name}
        </h3>
      </ButtonBase>
    </Box>
  );
}
