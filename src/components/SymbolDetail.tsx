import React, { useEffect, useState } from "react";
import SymbolContainer from "./SymbolContainer";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { MiniChart, CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
};

export default function SymbolDetail({
  tickerSymbol,
  ...args
}: SymbolDetailProps) {
  const navigate = useNavigate();

  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

  const [etfHolders, setEtfHolders] = useState([]);

  useEffect(() => {
    if (tickerSymbol) {
      store.getSymbolETFHolders(tickerSymbol).then(setEtfHolders);
    }
  }, [tickerSymbol]);

  console.log({ etfHolders: etfHolders?.results });

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

      <div>
        {
          // TODO: Paginate through these results
        }
        {etfHolders?.results?.map((etfHolderSymbol) => (
          <Button
            key={etfHolderSymbol}
            onClick={() =>
              // TODO: Don't hardcode here
              // TODO: Perhaps don't even navigate... just add the symbol to this view?
              navigate(`/search?query=${etfHolderSymbol}&exact=true`)
            }
          >
            {etfHolderSymbol}
          </Button>
        ))}
      </div>
    </SymbolContainer>
  );
}
