import React from "react";

import { Typography, useMediaQuery, useTheme } from "@mui/material";

import TradingViewLogo from "@assets/vendor/trading-view-logo.svg?react";
import { Footer } from "@layoutKit/Layout";

import NetworkRequestIndicator from "../../NetworkRequestIndicator";
import TickerTape from "./TickerTape";

export default function MainLayoutFooter() {
  const theme = useTheme();
  const shouldShowNetworkURL = useMediaQuery("@media (min-width:480px)");

  return (
    <Footer>
      <NetworkRequestIndicator
        style={{ position: "absolute", left: 8, top: 0 }}
        showNetworkURL={shouldShowNetworkURL}
      />
      <Typography
        variant="body2"
        color="textSecondary"
        align="right"
        style={{ whiteSpace: "nowrap", marginRight: 4 }}
      >
        <TradingViewLogo
          style={{
            verticalAlign: "top",
            marginRight: "4px",
            height: "20px",
            width: "20px",
            display: "inline-block",
          }}
          title="TradingView"
        />
        labeled charts provided by{" "}
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.palette.primary.main }}
        >
          TradingView
        </a>
      </Typography>
      <TickerTape />
    </Footer>
  );
}
