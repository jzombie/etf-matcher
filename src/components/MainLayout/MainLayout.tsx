import React from "react";
import { TickerTape } from "react-ts-tradingview-widgets";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button,
  CssBaseline,
  useTheme,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import useStoreStateReader from "@hooks/useStoreStateReader";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
// import SearchModalButton from "../SearchModalButton";

export default function MainLayout() {
  const theme = useTheme();

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
      <CssBaseline />
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <HeaderMenu />
            {/*
              <SearchModalButton />
              */}
          </Toolbar>
        </AppBar>
        <Container
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: theme.spacing(2),
          }}
        >
          <Box sx={{ width: "100%", flex: 1, display: "flex" }}>
            {!isRustInit ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" component="div" textAlign="center">
                  Initializing...
                </Typography>
              </Box>
            ) : (
              <Outlet />
            )}
          </Box>
        </Container>
        <Box
          component="footer"
          sx={{
            textAlign: "left",
            padding: theme.spacing(1),
            backgroundColor: theme.palette.background.default,
          }}
        >
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
        </Box>
      </Box>
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
