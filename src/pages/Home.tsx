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

import store, { CustomState } from "../store";
import { useEmitterState } from "../utils/EmitterState";

<TickerTape colorTheme="dark"></TickerTape>;

export default function Home() {
  const { dataBuildTime } = useEmitterState(store, "dataBuildTime");

  return (
    <div>
      {dataBuildTime}

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

      <PortfolioForm />
    </div>
  );
}
