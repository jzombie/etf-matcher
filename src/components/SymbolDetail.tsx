import React, { useEffect, useState } from "react";
import SymbolContainer from "./SymbolContainer";
import { Button, Typography, Grid, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Padding from "@layoutKit/Padding";

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
        <Padding>
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Company Name
                </Typography>
                <Typography variant="body1">
                  {symbolDetail?.company_name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Sector
                </Typography>
                <Typography variant="body1">
                  {symbolDetail?.sector || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Industry
                </Typography>
                <Typography variant="body1">
                  {symbolDetail?.industry || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  ETF Status
                </Typography>
                <Typography variant="body1">
                  {symbolDetail?.is_etf ? "ETF" : "Not ETF"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  DCA
                </Typography>
                <Typography variant="body1">
                  {symbolDetail?.score_avg_dca || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Padding>
        <div style={{ height: 200 }}>
          {
            // https://tradingview-widgets.jorrinkievit.xyz/docs/components/MiniChart
          }
          <MiniChart
            symbol={tickerSymbol}
            colorTheme="dark"
            width="100%"
            height="100%"
            copyrightStyles={tradingViewCopyrightStyles}
            dateRange="ALL" // 1D / 1M / 3M / 12M / 60M / ALL
            // TODO: Provide ability to configure date range
            // isTransparent={true}
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
