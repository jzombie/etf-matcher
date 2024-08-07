import React from "react";

import { Typography, useMediaQuery, useTheme } from "@mui/material";

import { Footer } from "@layoutKit/Layout";
import {
  DEFAULT_SECTOR_SYMBOLS,
  TRADING_VIEW_COPYRIGHT_STYLES,
} from "@src/constants";
import { TickerTape } from "react-ts-tradingview-widgets";

import NetworkRequestIndicator from "./NetworkRequestIndicator";

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
        style={{ whiteSpace: "nowrap" }}
      >
        {
          // TODO: Be more specific about which charts are provided by TradingView.
          // If possible to use their `TV` logo snippet as part of this string,
          // that would be even better.
        }
        Charts provided by{" "}
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.palette.primary.main }}
        >
          TradingView
        </a>
      </Typography>
      <TickerTape
        colorTheme="dark"
        copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
        symbols={DEFAULT_SECTOR_SYMBOLS}
      />
    </Footer>
  );
}
