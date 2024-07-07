import "react";
import { Button, Flex } from "antd";
import { Link } from "react-router-dom";
import investmentDisclaimer from "@constants/investmentDisclaimer";
// import PortfolioForm from "@/components/PortfolioForm";

// https://tradingview-widgets.jorrinkievit.xyz/docs/components/Screener
import {
  StockMarket,
  Screener,
  TickerTape,
} from "react-ts-tradingview-widgets";
import { SymbolInfo } from "react-ts-tradingview-widgets";

// import store, { CustomState } from "../store";
// import { useStateEmitterReader } from "../utils/StateEmitter";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

<TickerTape colorTheme="dark"></TickerTape>;

export default function Home() {
  const { count } = useStoreStateReader(["count"]);

  return (
    <div>
      <p style={{ fontWeight: "bold" }}>
        Customize a virtual portfolio, with potential fractional shares, and
        find ETFs which most closely match (using a vector search algorithm).
      </p>

      <p style={{ fontWeight: "bold" }}>
        After you find the ETFs that most closely match your investment goals,
        trade them on your platform of choice!
      </p>

      <p>
        Disclaimer: The information provided on this platform is for
        informational purposes only and does not constitute financial,
        investment, or other professional advice. You should not rely on this
        information to make any investment decisions. Always consult with a
        qualified financial advisor before making any investment decisions. We
        do not guarantee the accuracy, completeness, or timeliness of any
        information provided and shall not be held liable for any errors or
        omissions, or for any loss or damage incurred as a result of using this
        information.
      </p>

      <div>{count}</div>
      <div>
        <Button onClick={() => store.PROTO_getSymbols()}>
          PROTO::getSymbols()
        </Button>

        <Button onClick={() => store.PROTO_countEtfsPerExchange()}>
          PROTO::countEtfsPerExchange()
        </Button>

        <Button onClick={() => store.PROTO_getEtfHolderAssetCount()}>
          PROTO::getEtfHolderAssetCount()
        </Button>
      </div>
      {/* <StockMarket colorTheme="dark" height={400} width="100%"></StockMarket>
      <TickerTape colorTheme="dark"></TickerTape>
      <Screener colorTheme="dark" width="100%" height={300}></Screener>
      <SymbolInfo colorTheme="dark" autosize></SymbolInfo> */}
      {/* <PortfolioForm /> */}
    </div>
  );
}
