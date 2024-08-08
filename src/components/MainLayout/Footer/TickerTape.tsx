import React, { useEffect, useMemo, useState } from "react";

import { TRADING_VIEW_COPYRIGHT_STYLES } from "@src/constants";
import {
  TickerTape as LibTickerTape,
  TickerTapeSymbol,
} from "react-ts-tradingview-widgets";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

export default function TickerTape() {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");
  const tickerTapeBucket = useMemo(() => {
    // Note: `tickerBuckets` is used solely to update this `useMemo` on change
    if (tickerBuckets) {
      const tickerTapeBuckets = store.getTickerBucketsOfType("ticker_tape");
      const tickerTapeBucket = tickerTapeBuckets[0];

      return tickerTapeBucket;
    }
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
