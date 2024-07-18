import React, { useEffect, useState } from "react";
import SymbolContainer from "../SymbolContainer";
import { Button, Typography, Grid, Box } from "@mui/material";
import Padding from "@layoutKit/Padding";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import type {
  RustServiceSymbolDetail,
  RustServiceETFHoldersWithTotalCount,
  RustServiceETFAggregateDetail,
} from "@utils/callWorkerFunction";
import { MiniChart } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { styled } from "@mui/system";
import EncodedImage from "../EncodedImage";

import ETFHolder from "./SymbolDetail.ETFHolder";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
};

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0 50px 50px 0",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  marginRight: theme.spacing(2),
}));

const InfoContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  width: "100%",
}));

const SymbolDetailWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
}));

export default function SymbolDetail({
  tickerSymbol,
  onIntersectionStateChange,
  ...rest
}: SymbolDetailProps) {
  const { symbolBuckets } = useStoreStateReader(["symbolBuckets"]);
  const [symbolDetail, setSymbolDetail] = useState<
    RustServiceSymbolDetail | undefined
  >(undefined);
  const [etfHolders, setEtfHolders] = useState<
    RustServiceETFHoldersWithTotalCount | undefined
  >(undefined);
  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);

  useEffect(() => {
    if (tickerSymbol) {
      store.fetchSymbolDetail(tickerSymbol).then(setSymbolDetail);
      store.fetchSymbolETFHolders(tickerSymbol).then(setEtfHolders);
    }
  }, [tickerSymbol]);

  useEffect(() => {
    if (symbolDetail?.is_etf) {
      store
        .fetchETFAggregateDetail(symbolDetail.symbol)
        .then(setETFAggregateDetail);
    }
  }, [symbolDetail]);

  return (
    <SymbolContainer
      style={{ marginBottom: 12 }}
      tickerSymbol={tickerSymbol}
      onIntersectionStateChange={onIntersectionStateChange}
      {...rest}
    >
      <SymbolDetailWrapper>
        <LogoContainer>
          <EncodedImage
            encSrc={symbolDetail?.logo_filename}
            title={`${symbolDetail?.symbol} logo`}
            style={{ width: 80, height: 80 }}
          />
        </LogoContainer>
        <InfoContainer>
          <Padding>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Company
                </Typography>
                <Typography variant="body2">
                  {symbolDetail?.company_name}
                  &nbsp;{symbolDetail?.symbol && `(${symbolDetail.symbol})`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Durability Rating
                </Typography>
                <Typography variant="body2">
                  {(symbolDetail?.score_avg_dca &&
                    `${symbolDetail?.score_avg_dca.toFixed(2)} / 5.00`) ||
                    "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Sector
                </Typography>
                <Typography variant="body2">
                  {symbolDetail?.sector_name || "N/A"}
                  <>
                    {etfAggregateDetail?.top_market_value_sector_name &&
                      symbolDetail?.sector_name !==
                        etfAggregateDetail?.top_market_value_sector_name && (
                        <>
                          {" "}
                          ({etfAggregateDetail.top_market_value_sector_name})
                        </>
                      )}
                  </>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Industry
                </Typography>
                <Typography variant="body2">
                  {symbolDetail?.industry_name || "N/A"}
                  <>
                    {etfAggregateDetail?.top_market_value_industry_name &&
                      symbolDetail?.industry_name !==
                        etfAggregateDetail?.top_market_value_industry_name && (
                        <>
                          {" "}
                          ({etfAggregateDetail.top_market_value_industry_name})
                        </>
                      )}
                  </>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  ETF Status
                </Typography>
                {!symbolDetail?.is_etf ? (
                  <>Not ETF</>
                ) : (
                  <div
                    style={{
                      border: "1px rgba(255,255,255,.1) solid",
                      borderRadius: 2,
                      marginTop: 1,
                      padding: 1,
                      margin: 4,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Top Holdings
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">
                          Market Value
                        </Typography>
                        <Typography variant="body2">
                          Sector:{" "}
                          {etfAggregateDetail?.top_market_value_sector_name}
                        </Typography>
                        <Typography variant="body2">
                          Industry:{" "}
                          {etfAggregateDetail?.top_market_value_industry_name}
                        </Typography>
                        <Typography variant="body2">
                          Value:{" "}
                          {etfAggregateDetail?.aggregate_market_value &&
                            etfAggregateDetail?.currency_code &&
                            new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: etfAggregateDetail?.currency_code,
                            }).format(
                              etfAggregateDetail?.aggregate_market_value
                            )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">
                          Percentage Weight
                        </Typography>
                        <Typography variant="body2">
                          Sector: {etfAggregateDetail?.top_pct_sector_name}
                        </Typography>
                        <Typography variant="body2">
                          Industry: {etfAggregateDetail?.top_pct_industry_name}
                        </Typography>
                        <Typography variant="body2">
                          Weight:{" "}
                          {etfAggregateDetail?.pct_market_weight.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </div>
                )}
              </Grid>
            </Grid>
          </Padding>
        </InfoContainer>
      </SymbolDetailWrapper>

      <div style={{ height: 200 }}>
        <MiniChart
          symbol={tickerSymbol}
          colorTheme="dark"
          width="100%"
          height="100%"
          copyrightStyles={tradingViewCopyrightStyles}
          dateRange="ALL"
        />
      </div>

      {symbolBuckets
        ?.filter((symbolBucket) => symbolBucket.isUserConfigurable)
        .map((symbolBucket, idx) => (
          <Button
            key={idx}
            onClick={() => store.addSymbolToBucket(tickerSymbol, symbolBucket)}
          >
            Add {tickerSymbol} to {symbolBucket.name}
          </Button>
        ))}
      <div>
        {etfHolders?.results?.map((etfHolderSymbol) => (
          <ETFHolder key={etfHolderSymbol} etfSymbol={etfHolderSymbol} />
        ))}
      </div>
    </SymbolContainer>
  );
}
