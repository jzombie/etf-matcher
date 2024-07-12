import React from "react";
import SymbolContainer from "./SymbolContainer";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import { Button } from "@mui/material";

import { MiniChart, CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
};

export default function SymbolDetail({
  tickerSymbol,
  ...args
}: SymbolDetailProps) {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

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
      {
        // TODO: Enable via toggle
        /* <CompanyProfile
        symbol={tickerSymbol}
        width="100%"
        height={300}
        copyrightStyles={tradingViewCopyrightStyles}
      /> */
      }

      {symbolBuckets?.map((symbolBucket, idx) => (
        // TODO: If symbol is already in the bucket, don't try to re-add it
        <Button
          key={idx}
          onClick={() => store.addSymbolToBucket(tickerSymbol, symbolBucket)}
        >
          Add {tickerSymbol} to {symbolBucket.name}
        </Button>
      ))}

      <Button onClick={() => store.PROTO_getSymbolDetail(tickerSymbol)}>
        PROTO_getSymbolDetail()
      </Button>

      <Button onClick={() => store.PROTO_getSymbolETFHolders(tickerSymbol)}>
        PROTO_getSymbolETFHolders()
      </Button>
    </SymbolContainer>
  );
}
