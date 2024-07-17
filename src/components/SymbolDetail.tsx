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
import { MiniChart } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
// import ProtoStockLogoImg from "@assets/PROTO_stock_logo.png";
import { styled } from "@mui/system";

import EncodedImage from "./EncodedImage";

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
  // boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(4),
}));

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

  useEffect(() => {
    if (tickerSymbol) {
      store.fetchSymbolDetail(tickerSymbol).then(setSymbolDetail);
      store.fetchSymbolETFHolders(tickerSymbol).then(setEtfHolders);
    }
  }, [tickerSymbol]);

  // TODO: Handle accordingly
  useEffect(() => {
    if (symbolDetail?.is_etf) {
      store
        .fetchETFAggregateDetail(symbolDetail.symbol)
        .then((etfAggregateDetail) => {
          console.debug({
            etfAggregateDetail,
          });
        });
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
                  {symbolDetail?.sector || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Industry
                </Typography>
                <Typography variant="body2">
                  {symbolDetail?.industry || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  ETF Status
                </Typography>
                <Typography variant="body2">
                  {symbolDetail?.is_etf ? "ETF" : "Not ETF"}
                </Typography>
              </Grid>
            </Grid>
          </Padding>
        </InfoContainer>
      </SymbolDetailWrapper>

      <div style={{ height: 200 }}>
        <MiniChart
          // TODO: It is very important that the exchange gets encoded into this as well (fixes
          // issues such as: Fix issue where querying "BRK-B" lands on "BROOKS MACDONALD GROUP ORD GBP0.01")
          // For BRK-B: symbol={`NYSE:${tickerSymbol.replaceAll("-", ".")}`}
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
          <Button
            key={etfHolderSymbol}
            onClick={() =>
              navigate(`/search?query=${etfHolderSymbol}&exact=true`)
            }
          >
            {etfHolderSymbol}
          </Button>
        ))}
      </div>
    </SymbolContainer>
  );
}
