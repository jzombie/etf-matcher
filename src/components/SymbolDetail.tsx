import React, { useEffect, useMemo, useRef, useState } from "react";
import SymbolContainer from "./SymbolContainer";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import type { RustServiceETFHoldersWithTotalCount } from "@src/store";

import {
  MiniChart,
  Timeline,
  // CompanyProfile,
} from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
  groupTickerSymbols: string[];
};

export default function SymbolDetail({
  tickerSymbol,
  groupTickerSymbols,
  ...rest
}: SymbolDetailProps) {
  const navigate = useNavigate();

  const { symbolBuckets } = useStoreStateReader(["symbolBuckets"]);

  const [isFullRenderSymbol, setIsFullRenderSymbol] = useState(false);

  useEffect(() => {
    if (isFullRenderSymbol) {
      // TODO: Remove
      console.warn({
        tickerSymbol,
        isFullRenderSymbol,
      });
    }
  }, [tickerSymbol, isFullRenderSymbol]);

  const [etfHolders, setEtfHolders] = useState<
    RustServiceETFHoldersWithTotalCount | undefined
  >(undefined);

  // Only query symbols that are fully rendered, or are next in the list
  useEffect(() => {
    if (tickerSymbol && isFullRenderSymbol) {
      store.getSymbolETFHolders(tickerSymbol).then(setEtfHolders);
    }
  }, [tickerSymbol, isFullRenderSymbol]);

  return (
    <SymbolContainer
      style={{ marginBottom: 12 }}
      {...rest}
      tickerSymbol={tickerSymbol}
      groupTickerSymbols={groupTickerSymbols}
      onFullRenderSymbolStateChange={setIsFullRenderSymbol}
    >
      {!isFullRenderSymbol ? (
        <div
          style={{
            height: 500,
            // TODO: Remove? This should never be visible, anyway, if the `isFullRenderSymbol` algorithm is working correct
            backgroundColor: "yellow",
          }}
        />
      ) : (
        <>
          {" "}
          {/* <MiniChart
            symbol={tickerSymbol}
            colorTheme="dark"
            width="100%"
            copyrightStyles={tradingViewCopyrightStyles}
          /> */}
          {
            // TODO: Enable via toggle
            /* <CompanyProfile
            symbol={tickerSymbol}
            width="100%"
            height={300}
            copyrightStyles={tradingViewCopyrightStyles}
          /> */
          }
          {/* <Timeline
            colorTheme="dark"
            feedMode="symbol"
            symbol={tickerSymbol}
            height={400}
            width="100%"
            copyrightStyles={tradingViewCopyrightStyles}
          /> */}
          {symbolBuckets?.map((symbolBucket, idx) => (
            // TODO: If symbol is already in the bucket, don't try to re-add it
            <Button
              key={idx}
              onClick={() =>
                store.addSymbolToBucket(tickerSymbol, symbolBucket)
              }
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
        </>
      )}
    </SymbolContainer>
  );
}
