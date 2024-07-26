import React, { useMemo } from "react";
import TickerDetailList from "@components/TickerDetailList";

import Typography from "@mui/material/Typography";

import Padding from "@layoutKit/Padding";

import SearchModalButton from "./SearchModalButton";

import useStoreStateReader from "@hooks/useStoreStateReader";
import type { SymbolBucketProps } from "@src/store";

export type BucketListProps = {
  bucketType: SymbolBucketProps["bucketType"];
};

export default function BucketList({ bucketType }: BucketListProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const localSymbolBucket = useMemo(
    () =>
      tickerBuckets?.filter(
        (tickerBucket) => tickerBucket.bucketType === bucketType
      ),
    [tickerBuckets, bucketType]
  );

  return (
    <>
      {localSymbolBucket?.map((tickerBucket, idx) => (
        <React.Fragment key={idx}>
          <Padding>
            <h2>{tickerBucket.name}</h2>

            {!tickerBucket.tickers.length && (
              <>
                <Typography variant="body2" color="textSecondary">
                  No items in &quot;{tickerBucket.name}&quot;.
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "inline-block", marginRight: 1 }}
                >
                  Perhaps you might wish to perform a{" "}
                  {/* [`Search` button follows] */}
                </Typography>
                <SearchModalButton />
              </>
            )}
          </Padding>

          <TickerDetailList
            tickerIds={tickerBucket.tickers.map(({ tickerId }) => tickerId)}
          />
        </React.Fragment>
      ))}
    </>
  );
}
