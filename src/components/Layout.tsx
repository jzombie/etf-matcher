import React from "react";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Layout as AntLayout, Menu, Button } from "antd";
import { Link, Outlet, useLocation, matchPath } from "react-router-dom";
// import { SaveOutlined } from "@ant-design/icons";
import useStoreStateReader from "@hooks/useStoreStateReader";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

const { Header, Content, Footer } = AntLayout;

// TODO: Experiment w/ old newspaper design for background

export default function Layout() {
  const location = useLocation();

  // Define the base paths for the main menu items
  const menuItems = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/sectors", label: <Link to="/sectors">Sectors</Link> },
    { key: "/portfolio", label: <Link to="/portfolio">Portfolio</Link> },
    { key: "/about", label: <Link to="/about">About</Link> },
  ];

  const selectedKey = menuItems.find(
    (item) =>
      matchPath({ path: item.key, end: true }, location.pathname) ||
      matchPath({ path: `${item.key}/*`, end: false }, location.pathname)
  )?.key;

  const { isRustInit, prettyDataBuildTime, isDirtyState } = useStoreStateReader(
    ["isRustInit", "prettyDataBuildTime", "isDirtyState"]
  );

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          style={{ flex: 1 }}
        />
        {
          // TODO: Add save button
          /* <Button
          type="primary"
          icon={<SaveOutlined />}
          style={{ marginLeft: "auto" }}
          disabled={!isDirtyState}
        >
          Save
        </Button> */
        }
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
              ? `Date build time: ${prettyDataBuildTime}`
              : ""}
          </span>
          {" | "}
          <span>{isDirtyState ? "Not Saved" : "Saved"}</span>

          <span style={{ float: "right" }}>
            Charts provided by{" "}
            <a href="https://www.tradingview.com/" target="_blank">
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
