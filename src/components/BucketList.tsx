import React, { useMemo } from "react";
import { Button } from "@mui/material";
import TickerDetailList from "@components/TickerDetailList";

import Typography from "@mui/material/Typography";

import Padding from "@layoutKit/Padding";

import SearchModalButton from "./SearchModalButton";

import useStoreStateReader from "@hooks/useStoreStateReader";
import store from "@src/store";
import type { TickerBucketProps } from "@src/store";

export type BucketListProps = {
  bucketType: TickerBucketProps["type"];
};

export default function BucketList({ bucketType }: BucketListProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const localTickerBucket = useMemo(
    () =>
      tickerBuckets?.filter((tickerBucket) => tickerBucket.type === bucketType),
    [tickerBuckets, bucketType]
  );

  return (
    <>
      {localTickerBucket?.map((tickerBucket, idx) => (
        <React.Fragment key={idx}>
          <Padding>
            <div>
              <h2>{tickerBucket.name}</h2>

              <div>{tickerBucket.description}</div>

              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  // TODO: Show confirmation modal before delete (or trigger
                  // async confirmation via store to unify the process)
                  store.deleteTickerBucket(tickerBucket);
                }}
              >
                Delete Bucket
              </Button>
            </div>

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
