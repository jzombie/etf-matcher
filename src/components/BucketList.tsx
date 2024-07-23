import React, { useMemo } from "react";
import SymbolDetailList from "@components/SymbolDetailList";

import Typography from "@mui/material/Typography";

import Padding from "@layoutKit/Padding";

import SearchModalButton from "./SearchModalButton";

import useStoreStateReader from "@hooks/useStoreStateReader";
import type { SymbolBucketProps } from "@src/store";

export type BucketListProps = {
  bucketType: SymbolBucketProps["type"];
};

export default function BucketList({ bucketType }: BucketListProps) {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

  const localSymbolBucket = useMemo(
    () =>
      symbolBuckets?.filter((symbolBucket) => symbolBucket.type === bucketType),
    [symbolBuckets, bucketType]
  );

  return (
    <>
      {localSymbolBucket?.map((symbolBucket, idx) => (
        <React.Fragment key={idx}>
          <Padding>
            <h2>{symbolBucket.name}</h2>

            {!symbolBucket.tickers.length && (
              <>
                <Typography variant="body2" color="textSecondary">
                  No items in &quot;{symbolBucket.name}&quot;.
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

          <SymbolDetailList
            tickerSymbols={symbolBucket.tickers.map(({ symbol }) => symbol)}
          />
        </React.Fragment>
      ))}
    </>
  );
}
