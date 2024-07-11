import React from "react";
import SymbolContainer from "./SymbolContainer";
import { store } from "@hooks/useStoreStateReader";
import { Button } from "antd";

import { MiniChart, CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
};

export default function SymbolDetail({
  tickerSymbol,
  ...args
}: SymbolDetailProps) {
  return (
    <SymbolContainer
      style={{ marginBottom: 12 }}
      {...args}
      tickerSymbol={tickerSymbol}
    >
      <MiniChart
        symbol={tickerSymbol}
        colorTheme="dark"
        width="100%"
        copyrightStyles={tradingViewCopyrightStyles}
      />
      <CompanyProfile
        symbol={tickerSymbol}
        width="100%"
        height={300}
        copyrightStyles={tradingViewCopyrightStyles}
      />
      <Button onClick={() => store.addSymbolToPortfolio(tickerSymbol)}>
        Add {tickerSymbol} to Portfolio
      </Button>

      <Button onClick={() => store.PROTO_getSymbolDetail(tickerSymbol)}>
        PROTO_getSymbolDetail()
      </Button>

      <Button onClick={() => store.PROTO_getSymbolETFHolders(tickerSymbol)}>
        PROTO_getSymbolETFHolders()
      </Button>
    </SymbolContainer>
  );
}
