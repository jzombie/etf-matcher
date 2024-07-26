import React from "react";
import { Button } from "@mui/material";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import type { RustServiceTickerDetail } from "@src/types";

export type TickerDetailBucketManagerProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerDetailBucketManager({
  tickerDetail,
}: TickerDetailBucketManagerProps) {
  const { tickerBuckets } = useStoreStateReader(["tickerBuckets"]);

  return (
    <>
      {tickerBuckets
        ?.filter((tickerBucket) => tickerBucket.isUserConfigurable)
        .map((tickerBucket, idx) => {
          if (!store.bucketHasTicker(tickerDetail.ticker_id, tickerBucket)) {
            return (
              <Button
                key={idx}
                onClick={() =>
                  store.addTickerToBucket(
                    tickerDetail.ticker_id,
                    1,
                    tickerBucket
                  )
                }
              >
                Add {tickerDetail.symbol} to {tickerBucket.name}
              </Button>
            );
          } else {
            return (
              <Button
                key={idx}
                onClick={() =>
                  store.removeTickerFromBucket(
                    tickerDetail.ticker_id,
                    tickerBucket
                  )
                }
              >
                Remove {tickerDetail.symbol} from {tickerBucket.name}
              </Button>
            );
          }
        })}
    </>
  );
}
