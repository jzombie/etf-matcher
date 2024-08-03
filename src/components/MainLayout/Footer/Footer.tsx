import React from "react";

import { Typography, useMediaQuery, useTheme } from "@mui/material";

import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { Footer } from "@layoutKit/Layout";
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
        copyrightStyles={tradingViewCopyrightStyles}
        symbols={SECTOR_SYMBOLS}
      />
    </Footer>
  );
}

// TODO: Move; don't hardcode here
//
// https://tradingview-widgets.jorrinkievit.xyz/docs/components/TickerTape#ticker-symbol
const SECTOR_SYMBOLS = [
  { proName: "XLY", title: "Consumer Discretionary (XLY)" },
  { proName: "XLP", title: "Consumer Staples (XLP)" },
  { proName: "XLE", title: "Energy (XLE)" },
  { proName: "XLF", title: "Financials (XLF)" },
  { proName: "XLV", title: "Healthcare (XLV)" },
  { proName: "XLI", title: "Industrials (XLI)" },
  { proName: "XLB", title: "Materials (XLB)" },
  { proName: "XLRE", title: "Real Estate (XLRE)" },
  { proName: "XLK", title: "Technology (XLK)" },
  { proName: "XLC", title: "Telecommunications (XLC)" },
  { proName: "XLU", title: "Utilities (XLU)" },
];
