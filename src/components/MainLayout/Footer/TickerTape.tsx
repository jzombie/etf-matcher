import React, { useEffect, useMemo, useRef, useState } from "react";

import { TRADING_VIEW_COPYRIGHT_STYLES } from "@src/constants";
import type { TickerBucketProps } from "@src/store";
import {
  TickerTape as LibTickerTape,
  TickerTapeSymbol,
} from "react-ts-tradingview-widgets";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import deepEqual from "@utils/deepEqual";

export default function TickerTape() {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");
  const previousTickerTapeBucketRef = useRef<TickerBucketProps | null>(null);

  const tickerTapeBucket = useMemo(() => {
    if (tickerBuckets) {
      const tickerTapeBuckets = store.getTickerBucketsOfType("ticker_tape");
      const newTickerTapeBucket = tickerTapeBuckets[0];

      if (
        // Note: The `deepEqual` fixes an issue where the `tickerTapeBucket` would
        // not maintain a stable reference after history or other bucket updates,
        // causing the ticker tape to reload.
        !deepEqual(previousTickerTapeBucketRef.current, newTickerTapeBucket)
      ) {
        previousTickerTapeBucketRef.current = newTickerTapeBucket;
        return newTickerTapeBucket;
      }
    }
    return previousTickerTapeBucketRef.current;
  }, [tickerBuckets]);

  const [tickerTapeSymbols, setTickerTapeSymbols] = useState<
    TickerTapeSymbol[]
  >([]);

  useEffect(() => {
    if (!tickerTapeBucket?.tickers) {
      setTickerTapeSymbols([]);
    } else {
      const tickers = tickerTapeBucket.tickers;

      Promise.all(
        tickers.map((ticker) => store.fetchTickerDetail(ticker.tickerId)),
      ).then((tickerDetails) => {
        setTickerTapeSymbols(
          tickerDetails.map((tickerDetail) => ({
            proName: tickerDetail.symbol,
            title: `${tickerDetail.company_name} (${tickerDetail.symbol})`,
          })),
        );
      });
    }
  }, [tickerTapeBucket?.tickers]);

  if (!tickerTapeBucket?.tickers) {
    return null;
  }

  return (
    <LibTickerTape
      colorTheme="dark"
      copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
      symbols={tickerTapeSymbols}
    />
  );
}
