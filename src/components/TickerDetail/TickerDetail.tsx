import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  ButtonBase,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import store from "@src/store";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@src/types";

import Section from "@components/Section";

import useImageBackgroundColor from "@hooks/useImageBackgroundColor";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useURLState from "@hooks/useURLState";

import formatCurrency from "@utils/formatCurrency";
import formatSymbolWithExchange from "@utils/formatSymbolWithExchange";

import EncodedImage from "../EncodedImage";
import TickerContainer from "../TickerContainer";
import TickerDetailBucketManager from "./TickerDetail.BucketManager";
import ETFHolderList from "./TickerDetail.ETFHolderList";
import FinancialReport from "./TickerDetail.FinancialReport";
import PriceChart from "./TickerDetail.PriceChart";

export type TickerDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerId: number;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
  onLoad?: () => void;
  preventLoadingSpinner?: boolean;
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

export default function TickerDetail({
  tickerId,
  onIntersectionStateChange,
  onLoad,
  preventLoadingSpinner = false,
  ...rest
}: TickerDetailProps) {
  const [isLoadingTickerDetail, setIsLoadingTickerDetail] =
    useState<boolean>(false);

  const [tickerDetail, setSymbolDetail] =
    useState<RustServiceTickerDetail | null>(null);

  const logoBackgroundColorOverride = useImageBackgroundColor(
    tickerDetail?.logo_filename,
  );

  const [etfAggregateDetail, setETFAggregateDetail] =
    useState<RustServiceETFAggregateDetail | null>(null);

  // const [showNews, setShowNews] = useState(false);

  const onLoadStableCurrentRef = useStableCurrentRef(onLoad);

  useEffect(() => {
    if (tickerId) {
      setIsLoadingTickerDetail(true);

      store
        .fetchTickerDetail(tickerId)
        .then(setSymbolDetail)
        .finally(() => {
          setIsLoadingTickerDetail(false);

          if (typeof onLoadStableCurrentRef.current === "function") {
            onLoadStableCurrentRef.current();
          }
        });
    }
  }, [onLoadStableCurrentRef, tickerId]);

  useEffect(() => {
    if (tickerDetail?.is_etf) {
      store
        .fetchETFAggregateDetailByTickerId(tickerDetail.ticker_id)
        .then(setETFAggregateDetail);
    }
  }, [tickerDetail]);

  const formattedSymbolWithExchange = useMemo(
    () => tickerDetail && formatSymbolWithExchange(tickerDetail),
    [tickerDetail],
  );

  const { setURLState, toBooleanParam } = useURLState<{
    query: string | null;
    exact: string | null;
  }>();

  if (isLoadingTickerDetail && !preventLoadingSpinner) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  if (!formattedSymbolWithExchange || !tickerDetail) {
    return null;
  }

  return (
    <TickerContainer
      style={{ marginBottom: 12 }}
      tickerId={tickerDetail.ticker_id}
      onIntersectionStateChange={onIntersectionStateChange}
      {...rest}
    >
      <SymbolDetailWrapper>
        <LogoContainer
          style={
            logoBackgroundColorOverride
              ? { backgroundColor: logoBackgroundColorOverride }
              : {}
          }
        >
          <ButtonBase
            onClick={() =>
              setURLState(
                {
                  query: tickerDetail?.symbol,
                  exact: toBooleanParam(true),
                },
                false,
                "/search",
              )
            }
          >
            <EncodedImage
              encSrc={tickerDetail?.logo_filename}
              title={`${tickerDetail?.symbol} logo`}
              style={{ width: 80, height: 80 }}
            />
          </ButtonBase>
        </LogoContainer>

        <InfoContainer>
          <Padding>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Company
                </Typography>
                <Typography variant="body2">
                  {tickerDetail?.company_name}
                  &nbsp;
                  {`(${formattedSymbolWithExchange})`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Durability Rating
                </Typography>
                <Typography variant="body2">
                  {(tickerDetail?.score_avg_dca &&
                    `${tickerDetail?.score_avg_dca.toFixed(2)} / 5.00`) ||
                    "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="div">
                  Sector
                </Typography>
                <Typography variant="body2">
                  {tickerDetail?.sector_name || "N/A"}
                  <>
                    {etfAggregateDetail?.top_market_value_sector_name &&
                      tickerDetail?.sector_name !==
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
                  {tickerDetail?.industry_name || "N/A"}
                  <>
                    {etfAggregateDetail?.top_market_value_industry_name &&
                      tickerDetail?.industry_name !==
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
                {!tickerDetail?.is_etf ? (
                  <>Not ETF</>
                ) : (
                  <>
                    {etfAggregateDetail ? (
                      <div
                        style={{
                          border: "1px rgba(255,255,255,.1) solid",
                          borderRadius: 2,
                          marginTop: 1,
                          padding: 1,
                          margin: 4,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
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
                              {
                                etfAggregateDetail?.top_market_value_industry_name
                              }
                            </Typography>
                            <Typography variant="body2">
                              Value:{" "}
                              {etfAggregateDetail?.top_sector_market_value &&
                                etfAggregateDetail?.currency_code &&
                                formatCurrency(
                                  etfAggregateDetail.currency_code,
                                  etfAggregateDetail.top_sector_market_value,
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
                              Industry:{" "}
                              {etfAggregateDetail?.top_pct_industry_name}
                            </Typography>
                            <Typography variant="body2">
                              Weight:{" "}
                              {etfAggregateDetail?.top_pct_sector_weight?.toFixed(
                                2,
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    ) : (
                      <div>ETF</div>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </Padding>
        </InfoContainer>
      </SymbolDetailWrapper>

      <PriceChart
        tickerSymbol={tickerDetail.symbol}
        formattedSymbolWithExchange={formattedSymbolWithExchange}
      />

      <Box sx={{ textAlign: "center" }}>
        {/* <Button onClick={() => setShowNews(!showNews)} startIcon={<NewsIcon />}>
          {showNews ? "Hide News" : "View News"}
        </Button> */}
        <TickerDetailBucketManager tickerDetail={tickerDetail} />
      </Box>

      <Section>
        <FinancialReport tickerDetail={tickerDetail} />
      </Section>

      {/* {showNews && (
        // TODO: This seems out of date for `CRWD`, regardless if using `formattedSymbolWithExchange`
        // or just the `tickerSymbol` itself. Other symbols seem to be okay.
        <Timeline
          feedMode="symbol"
          colorTheme="dark"
          symbol={formattedSymbolWithExchange}
          width="100%"
          copyrightStyles={tradingViewCopyrightStyles}
        />
      )} */}

      {
        // TODO: Show `ETFHoldingList` (~inverse of `ETFHolderList`) if this is an ETF
      }
      {tickerDetail?.is_held_in_etf && (
        <ETFHolderList tickerDetail={tickerDetail} />
      )}
    </TickerContainer>
  );
}
