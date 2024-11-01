import React, { useCallback, useMemo } from "react";

import AssessmentIcon from "@mui/icons-material/Assessment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Typography } from "@mui/material";

import { TickerBucket } from "@src/store";
import customLogger from "@src/utils/customLogger";

import Section from "@components/Section";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import TickerBucketItem from "./TickerBucketItem";

export type TickerBucketListProps = {
  tickerBuckets: TickerBucket[];
};

export default function TickerBucketList({
  tickerBuckets,
}: TickerBucketListProps) {
  // Sort the tickerBuckets by their type
  const sortedTickerBuckets = useMemo(
    () => [...tickerBuckets].sort((a, b) => a.type.localeCompare(b.type)),
    [tickerBuckets],
  );

  const { triggerUIError } = useAppErrorBoundary();

  // TODO: Refactor to use a shared clipboard utility
  const copySymbolsToClipboard = useCallback(
    (symbols: string[]) => {
      const symbolsText = symbols.join(", ");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(symbolsText).then(
          () => {
            // TODO: Route to UI success notification
            customLogger.log("Symbols copied to clipboard:", symbolsText);
          },
          (err) => {
            customLogger.error(err);
            triggerUIError(new Error("Failed to copy symbols"));
          },
        );
      } else {
        customLogger.error("Clipboard API not supported");
        triggerUIError(new Error("Clipboard API not supported"));
      }
    },
    [triggerUIError],
  );

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {sortedTickerBuckets.map((tickerBucket, idx) => (
        <li key={idx}>
          <Section>
            {
              // TODO: Use dedicated icon, per bucket type, and use the same icon determination logic in the header
            }
            <AssessmentIcon
              sx={{
                fontSize: 24,
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: 1,
              }}
            />
            <Typography variant="body1" sx={{ display: "inline-block" }}>
              <span style={{ fontWeight: "bold" }}>{tickerBucket.name}</span>:{" "}
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: ".8rem",
                }}
              >
                ({tickerBucket.tickers.length} item
                {tickerBucket.tickers.length !== 1 ? "s" : ""};{" "}
                {tickerBucket.type})
              </span>
            </Typography>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              {tickerBucket.tickers.map((ticker) => (
                <TickerBucketItem
                  key={ticker.tickerId}
                  tickerBucketTicker={ticker}
                />
              ))}
            </div>
            {tickerBucket.tickers.length > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() =>
                  copySymbolsToClipboard(
                    tickerBucket.tickers.map((ticker) => ticker.symbol),
                  )
                }
                sx={{ mt: 1 }}
              >
                Copy Symbols
              </Button>
            )}
          </Section>
        </li>
      ))}
    </ul>
  );
}
