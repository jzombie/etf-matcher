import React, { useMemo } from "react";
import SymbolDetail from "@components/SymbolDetail";

import Typography from "@mui/material/Typography";

import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";

import SearchModalButton from "./SearchModalButton";

import useStoreStateReader from "@hooks/useStoreStateReader";
import type { SymbolBucketProps } from "@src/store";

export type ScrollableBucketListProps = {
  symbolBucketType: SymbolBucketProps["type"];
};

export default function ScrollableBucketList({
  symbolBucketType,
}: ScrollableBucketListProps) {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

  const localSymbolBucket = useMemo(
    () =>
      symbolBuckets?.filter(
        (symbolBucket) => symbolBucket.type === symbolBucketType
      ),
    [symbolBuckets, symbolBucketType]
  );

  return (
    <Scrollable>
      {localSymbolBucket?.map((symbolBucket, idx) => (
        <React.Fragment key={idx}>
          <Padding>
            <h2>{symbolBucket.name}</h2>

            {!symbolBucket.symbols.length && (
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

          {symbolBucket.symbols.map((symbol) => (
            <SymbolDetail key={symbol} tickerSymbol={symbol} />
          ))}
        </React.Fragment>
      ))}
    </Scrollable>
  );
}
