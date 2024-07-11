import React from "react";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";

import HeaderMenu from "./HeaderMenu";

import useStoreStateReader from "@hooks/useStoreStateReader";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import SearchModalButton from "../SearchModalButton";

const { Header, Content, Footer } = AntLayout;

// TODO: Experiment w/ vintage newspaper design for background

export default function Layout() {
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
        {
          // TODO: Open search modal
        }
        {/* <Button
          type="primary"
          icon={<SearchOutlined />}
          style={{ marginLeft: "auto" }}
        /> */}
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
        {
          // This wrapping div prevents child elements from stretching by default
        }
        <div style={{ width: "100%", height: "100%" }}>
          {
            // TODO: Don't block if on home screen so that content can render faster
          }
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
              <div
                style={{
                  textAlign: "center",
                }}
              >
                Initializing...
              </div>
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
        {
          // TODO: Show with specific Portfolio symbols once
        }
        <TickerTape
          colorTheme="dark"
          copyrightStyles={tradingViewCopyrightStyles}
          symbols={symbols}
        ></TickerTape>
      </Footer>
    </AntLayout>
  );
}

// https://tradingview-widgets.jorrinkievit.xyz/docs/components/TickerTape#ticker-symbol
const symbols = [
  {
    proName: "XLY",
    title: "Consumer Discretionary (XLY)",
  },
  {
    proName: "XLP",
    title: "Consumer Staples (XLP)",
  },
  {
    proName: "XLE",
    title: "Energy (XLE)",
  },
  {
    proName: "XLF",
    title: "Financials (XLF)",
  },
  {
    proName: "XLV",
    title: "Healthcare (XLV)",
  },
  {
    proName: "XLI",
    title: "Industrials (XLI)",
  },
  {
    proName: "XLB",
    title: "Materials (XLB)",
  },
  {
    proName: "XLRE",
    title: "Real Estate (XLRE)",
  },
  {
    proName: "XLK",
    title: "Technology (XLK)",
  },
  {
    proName: "XLC",
    title: "Telecommunications (XLC)",
  },
  {
    proName: "XLU",
    title: "Utilities (XLU)",
  },
  // {
  //   proName: "FOREXCOM:NSXUSD",
  //   title: "Nasdaq 100",
  // },
  // {
  //   proName: "FX_IDC:EURUSD",
  //   title: "EUR/USD",
  // },
  // {
  //   proName: "BITSTAMP:BTCUSD",
  //   title: "BTC/USD",
  // },
  // {
  //   proName: "BITSTAMP:ETHUSD",
  //   title: "ETH/USD",
  // },
];
