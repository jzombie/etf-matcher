import React from "react";
import { TickerTape } from "react-ts-tradingview-widgets";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  useTheme,
  CssBaseline,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import useStoreStateReader from "@hooks/useStoreStateReader";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

import Layout, {
  FullViewport,
  Center,
  Header,
  Content,
  Footer,
} from "@components/Layout";
// import SearchModalButton from "../SearchModalButton";

import useWindowSize from "@hooks/useWindowSize";

export default function MainLayout() {
  const theme = useTheme();

  const { width, height } = useWindowSize();

  const {
    isProductionBuild,
    isRustInit,
    prettyDataBuildTime,
    isDirtyState,
    visibleSymbols,
    isOnline,
  } = useStoreStateReader([
    "isProductionBuild",
    "isRustInit",
    "prettyDataBuildTime",
    "isDirtyState",
    "visibleSymbols",
    "isOnline",
  ]);

  return (
    <>
      <FullViewport>
        {/* <AppBar position="static">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <HeaderMenu />
            {
              // <SearchModalButton />
            }
          </Toolbar>
        </AppBar> */}

        <Layout>
          <Header>
            {" "}
            {width} x {height}
          </Header>

          <Content>
            {!isRustInit ? (
              <Center>
                <Typography variant="h6" component="div" textAlign="center">
                  Initializing...
                </Typography>
              </Center>
            ) : (
              <Layout>
                <Header>some header</Header>
                <Content>
                  <Outlet />
                </Content>
                <Footer>another footer</Footer>
              </Layout>
            )}
          </Content>
          <Footer>
            <Typography variant="body2" color="textSecondary">
              {prettyDataBuildTime
                ? `Data build time: ${prettyDataBuildTime}`
                : ""}
              {" | "}
              {isProductionBuild ? "PROD" : "DEV"}
              {" | "}
              {isDirtyState ? "Not Saved" : "Saved"}
              {" | "}
              {isOnline ? "Online" : "Offline"}
              {" | "}
              {visibleSymbols?.toString()}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="right">
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
              symbols={symbols}
            />
          </Footer>
        </Layout>
      </FullViewport>
    </>
  );
}

// https://tradingview-widgets.jorrinkievit.xyz/docs/components/TickerTape#ticker-symbol
const symbols = [
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
