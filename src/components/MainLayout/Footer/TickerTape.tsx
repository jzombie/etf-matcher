import React, { useEffect, useMemo, useRef, useState } from "react";

import { fetchTickerDetail } from "@services/RustService";
import {
  TRADING_VIEW_COPYRIGHT_STYLES,
  TRADING_VIEW_THEME,
} from "@src/constants";
import type { TickerBucket } from "@src/store";
import {
  TickerTape as LibTickerTape,
  TickerTapeSymbol,
} from "react-ts-tradingview-widgets";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import customLogger from "@utils/customLogger";
import deepEqual from "@utils/deepEqual";

export default function TickerTape() {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");
  const previousTickerTapeBucketRef = useRef<TickerBucket | null>(null);

  const tickerTapeBucket = useMemo(() => {
    if (tickerBuckets) {
      const tickerTapeBucket = store.getFirstTickerBucketOfType("ticker_tape");

      if (!tickerTapeBucket) {
        customLogger.warn("No ticker tape bucket found");
        return;
      }

      if (
        // Note: The `deepEqual` fixes an issue where the `tickerTapeBucket` would
        // not maintain a stable reference after history or other bucket updates,
        // causing the ticker tape to reload.
        !deepEqual(previousTickerTapeBucketRef.current, tickerTapeBucket)
      ) {
        previousTickerTapeBucketRef.current = tickerTapeBucket;
        return tickerTapeBucket;
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
        tickers.map((ticker) => fetchTickerDetail(ticker.tickerId)),
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
      colorTheme={TRADING_VIEW_THEME}
      copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
      symbols={tickerTapeSymbols}
    />
  );
}
