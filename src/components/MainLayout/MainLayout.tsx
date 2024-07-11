import React from "react";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import useStoreStateReader from "@hooks/useStoreStateReader";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import SearchModalButton from "../SearchModalButton";

const { Header, Content, Footer } = AntLayout;

export default function MainLayout() {
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
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <HeaderMenu />
        <SearchModalButton />
      </Header>
      <Content
        style={{
          padding: "10px 10px",
          height: 0, // Needs a height to force this container to stretch
          display: "flex",
          overflow: "auto",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          {!isRustInit ? (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
              }}
            >
              <div style={{ textAlign: "center" }}>Initializing...</div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "left", padding: 0, margin: 0 }}>
        <div style={{ color: "#999" }}>
          <span>
            {prettyDataBuildTime
              ? `Data build time: ${prettyDataBuildTime}`
              : ""}
          </span>
          {" | "}
          <span>{isProductionBuild ? "PROD" : "DEV"}</span>
          {" | "}
          <span>{isDirtyState ? "Not Saved" : "Saved"}</span>
          {" | "}
          <span>{isOnline ? "Online" : "Offline"}</span>
          {" | "}
          <span>{visibleSymbols?.toString()}</span>
          <span style={{ float: "right" }}>
            Charts provided by{" "}
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noreferrer"
            >
              TradingView
            </a>
          </span>
        </div>
        <TickerTape
          colorTheme="dark"
          copyrightStyles={tradingViewCopyrightStyles}
          symbols={symbols}
        />
      </Footer>
    </AntLayout>
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
