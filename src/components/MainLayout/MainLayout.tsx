import React from "react";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Typography, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

import FullViewport from "@layoutKit/FullViewport";
import Full from "@layoutKit/Full";
import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Layout, { Header, Content, Footer } from "@layoutKit/Layout";

import NetworkRequestNotifier from "@components/NetworkRequestNotifier";

import LockScreen from "@components/LockScreen";

export default function MainLayout() {
  const theme = useTheme();

  const { isAppUnlocked, isRustInit, isProfilingCacheOverlayOpen } =
    useStoreStateReader([
      "isAppUnlocked",
      "isRustInit",
      "isProfilingCacheOverlayOpen",
    ]);

  if (!isAppUnlocked) {
    return (
      <LockScreen onUnlock={() => store.setState({ isAppUnlocked: true })} />
    );
  }

  return (
    <FullViewport>
      <Layout>
        <Header>
          <HeaderMenu />
        </Header>

        <Content>
          {!isRustInit ? (
            // Note: `<Full>` is not needed here, but is used for testing
            <Full>
              <Center>
                <Typography variant="h6" component="div" textAlign="center">
                  Initializing...
                </Typography>
              </Center>
            </Full>
          ) : (
            <Outlet />
          )}
        </Content>
        <Footer>
          <NetworkRequestNotifier />
          <Typography variant="body2" color="textSecondary" align="right">
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
      </Layout>
      {isProfilingCacheOverlayOpen && (
        <Cover clickThrough>
          <Center>Profiling Cache</Center>
        </Cover>
      )}
    </FullViewport>
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
