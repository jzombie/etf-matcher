import React, { useEffect, useMemo, useState } from "react";
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

  const { symbolBuckets, visibleSymbols } = useStoreStateReader([
    "symbolBuckets",
    // TODO: Offload to `SymbolContainer`
    "visibleSymbols",
  ]);

  // TODO: Rename
  const isFullRenderSymbol = useMemo(() => {
    // TODO: Keep track of max visible symbol idx as a ref, regardless if
    // the page has been scrolled, to avoid re-querying on subsequent scrolling

    if (visibleSymbols.includes(tickerSymbol)) {
      return true;
    }

    const lastVisibleSymbol = visibleSymbols.at(-1);

    // TODO: Will it ever get here?
    if (!lastVisibleSymbol) {
      return false;
    }

    const idxGroupSymbols = groupTickerSymbols.indexOf(tickerSymbol);

    const idxGroupLastVisibleSymbol =
      groupTickerSymbols.indexOf(lastVisibleSymbol);

    if (idxGroupSymbols < idxGroupLastVisibleSymbol) {
      return true;
    }

    if (idxGroupSymbols === idxGroupLastVisibleSymbol) {
      return true;
    }

    return false;
  }, [tickerSymbol, groupTickerSymbols, visibleSymbols]);

  useEffect(() => {
    if (isFullRenderSymbol) {
      // TODO: Remove
      console.log({
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
