import "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import PortfolioForm from "../components/PortfolioForm";
// https://tradingview-widgets.jorrinkievit.xyz/docs/components/Screener
import {
  StockMarket,
  Screener,
  TickerTape,
} from "react-ts-tradingview-widgets";
import { SymbolInfo } from "react-ts-tradingview-widgets";

<TickerTape colorTheme="dark"></TickerTape>;

export default function Home() {
  return (
    <div>
      <StockMarket colorTheme="dark" height={400} width="100%"></StockMarket>
      <TickerTape colorTheme="dark"></TickerTape>
      <Screener colorTheme="dark" width="100%" height={300}></Screener>

      <SymbolInfo colorTheme="dark" autosize></SymbolInfo>
      {/* <div>
        <a href="https://www.tradingview.com" rel="noopener" target="_blank">
          <span className="blue-text">Stock Charts</span>
        </a>{" "}
        by TradingView
      </div> */}
      <script
        type="text/javascript"
        src="https://s3.tradingview.com/tv.js"
      ></script>
      <script type="text/javascript"></script>
      <PortfolioForm />
    </div>
  );
}
