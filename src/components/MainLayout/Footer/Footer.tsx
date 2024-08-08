import React, { useEffect, useMemo, useState } from "react";

import { Typography, useMediaQuery, useTheme } from "@mui/material";

import { Footer } from "@layoutKit/Layout";
import { TRADING_VIEW_COPYRIGHT_STYLES } from "@src/constants";
import { TickerTape, TickerTapeSymbol } from "react-ts-tradingview-widgets";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import NetworkRequestIndicator from "./NetworkRequestIndicator";

export default function MainLayoutFooter() {
  const theme = useTheme();

  const shouldShowNetworkURL = useMediaQuery("@media (min-width:480px)");

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

  return (
    <Footer>
      <NetworkRequestIndicator
        style={{ position: "absolute", left: 8, top: 0 }}
        showNetworkURL={shouldShowNetworkURL}
      />
      <Typography
        variant="body2"
        color="textSecondary"
        align="right"
        style={{ whiteSpace: "nowrap" }}
      >
        {
          // TODO: Be more specific about which charts are provided by TradingView.
          // If possible to use their `TV` logo snippet as part of this string,
          // that would be even better.
        }
        Charts provided by{" "}
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.palette.primary.main }}
        >
          TradingView
        </a>
      </Typography>
      {
        // TODO: Source from state
      }
      {tickerTapeBucket && (
        <TickerTape
          colorTheme="dark"
          copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
          symbols={tickerTapeSymbols}
        />
      )}
    </Footer>
  );
}
