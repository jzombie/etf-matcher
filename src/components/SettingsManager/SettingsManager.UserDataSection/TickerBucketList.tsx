import React, { useMemo } from "react";

import AssessmentIcon from "@mui/icons-material/Assessment";
import { Typography } from "@mui/material";

import { TickerBucket } from "@src/store";

import Section from "@components/Section";

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
          </Section>
        </li>
      ))}
    </ul>
  );
}
