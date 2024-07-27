import React, { useMemo } from "react";
import TickerDetailList from "@components/TickerDetailList";

import Typography from "@mui/material/Typography";

import Padding from "@layoutKit/Padding";

import SearchModalButton from "./SearchModalButton";

import useStoreStateReader from "@hooks/useStoreStateReader";
import type { TickerBucketProps } from "@src/store";

export type BucketListProps = {
  bucketType: TickerBucketProps["bucketType"];
};

export default function BucketList({ bucketType }: BucketListProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const localTickerBucket = useMemo(
    () =>
      tickerBuckets?.filter(
        (tickerBucket) => tickerBucket.bucketType === bucketType
      ),
    [tickerBuckets, bucketType]
  );

  return (
    <>
      {localTickerBucket?.map((tickerBucket, idx) => (
        <React.Fragment key={idx}>
          <Padding>
            <h2>{tickerBucket.name}</h2>

            <div>{tickerBucket.bucketDescription}</div>

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
