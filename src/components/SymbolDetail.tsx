import React, { useEffect, useState } from "react";
import SymbolContainer from "./SymbolContainer";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import type {
  RustServiceSymbolDetail,
  RustServiceETFHoldersWithTotalCount,
} from "@utils/callWorkerFunction";

import {
  MiniChart,
  // Timeline,
  // CompanyProfile,
} from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
};

export default function SymbolDetail({
  tickerSymbol,
  onIntersectionStateChange,
  ...rest
}: SymbolDetailProps) {
  const navigate = useNavigate();

  const { symbolBuckets } = useStoreStateReader(["symbolBuckets"]);

  const [symbolDetail, setSymbolDetail] = useState<
    RustServiceSymbolDetail | undefined
  >(undefined);

  const [etfHolders, setEtfHolders] = useState<
    RustServiceETFHoldersWithTotalCount | undefined
  >(undefined);

  // Only query symbols that are fully rendered, or are next in the list
  useEffect(() => {
    if (tickerSymbol) {
      store.fetchSymbolDetail(tickerSymbol).then(setSymbolDetail);
      store.fetchSymbolETFHolders(tickerSymbol).then(setEtfHolders);
    }
  }, [tickerSymbol]);

  return (
    <SymbolContainer
      style={{ marginBottom: 12 }}
      tickerSymbol={tickerSymbol}
      onIntersectionStateChange={onIntersectionStateChange}
      {...rest}
    >
      <>
        <div>{symbolDetail?.sector || "N/A"}</div>
        <div>{symbolDetail?.industry || "N/A"}</div>
        <div style={{ height: 200 }}>
          <MiniChart
            symbol={tickerSymbol}
            colorTheme="dark"
            width="100%"
            height="100%"
            copyrightStyles={tradingViewCopyrightStyles}
          />
        </div>

        {
          // TODO: For the following, wrap with a div to prevent potential reflow issues
        }

        {/* <MiniChart
            symbol={tickerSymbol}
            colorTheme="dark"
            width="100%"
            copyrightStyles={tradingViewCopyrightStyles}
          />
          // TODO: Enable via toggle
          /* <CompanyProfile
            symbol={tickerSymbol}
            width="100%"
            height={300}
            copyrightStyles={tradingViewCopyrightStyles}
          /> */}
        {/* <Timeline
          colorTheme="dark"
          feedMode="symbol"
          symbol={tickerSymbol}
          height={400}
          width="100%"
          copyrightStyles={tradingViewCopyrightStyles}
        /> */}
        {symbolBuckets
          ?.filter((symbolBucket) => symbolBucket.isUserConfigurable)
          .map((symbolBucket, idx) => (
            // TODO: If symbol is already in the bucket, don't try to re-add it
            <Button
              key={idx}
              onClick={() =>
                store.addSymbolToBucket(tickerSymbol, symbolBucket)
              }
            >
              Add {tickerSymbol} to {symbolBucket.name}
            </Button>
          ))}
        <div>
          {
            // TODO: Paginate through these results
          }
          {etfHolders?.results?.map((etfHolderSymbol) => (
            <Button
              key={etfHolderSymbol}
              onClick={() =>
                // TODO: Don't hardcode here
                // TODO: Perhaps don't even navigate... just add the symbol to this view?
                navigate(`/search?query=${etfHolderSymbol}&exact=true`)
              }
            >
              {etfHolderSymbol}
            </Button>
          ))}
        </div>
      </>
    </SymbolContainer>
  );
}
