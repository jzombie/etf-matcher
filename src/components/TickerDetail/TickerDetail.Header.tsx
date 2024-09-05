import React, { useEffect, useRef, useState } from "react";

import { Box, ButtonBase, Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Padding from "@layoutKit/Padding";

import useImageBackgroundColor from "@hooks/useImageBackgroundColor";
import useIntersectionObserver from "@hooks/useIntersectionObserver";
import useStoreStateReader from "@hooks/useStoreStateReader";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import EncodedImage from "../EncodedImage";
import TickerDetailStaticHeader from "./TickerDetail.Header.Static";

export type TickerDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerId: number;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
  onLoad?: () => void;
  preventLoadingSpinner?: boolean;
};

export type TickerDetailHeaderProps = {
  tickerDetail: RustServiceTickerDetail;
  etfAggregateDetail?: RustServiceETFAggregateDetail;
  formattedSymbolWithExchange: string;
};

// TODO: Add `expense_ratio` here
export default function TickerDetailHeader({
  tickerDetail,
  etfAggregateDetail,
  formattedSymbolWithExchange,
}: TickerDetailHeaderProps) {
  const logoBackgroundColorOverride = useImageBackgroundColor(
    tickerDetail.logo_filename,
  );

  const elRef = useRef<HTMLDivElement>(null);

  const isShowingStaticHeader = useStaticHeaderDeterminer(elRef, tickerDetail);

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <>
      {isShowingStaticHeader && (
        <TickerDetailStaticHeader tickerDetail={tickerDetail} />
      )}
      <SymbolDetailWrapper ref={elRef}>
        <LogoContainer
          style={
            logoBackgroundColorOverride
              ? { backgroundColor: logoBackgroundColorOverride }
              : {}
          }
        >
          <ButtonBase onClick={() => navigateToSymbol(tickerDetail?.symbol)}>
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
                {
                  // TODO: Use asset class instead
                }
                <Typography variant="h6" component="div">
                  ETF Status
                </Typography>
                {tickerDetail?.is_etf ? <>ETF</> : <>Not ETF</>}
              </Grid>
              {etfAggregateDetail?.expense_ratio && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" component="div">
                    Expense Ratio
                  </Typography>
                  {etfAggregateDetail.expense_ratio.toFixed(2)}%
                </Grid>
              )}
            </Grid>
          </Padding>
        </InfoContainer>
      </SymbolDetailWrapper>
    </>
  );
}

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

function useStaticHeaderDeterminer(
  elRef: React.MutableRefObject<HTMLDivElement | null>,
  tickerDetail: RustServiceTickerDetail,
) {
  const { visibleTickerIds } = useStoreStateReader("visibleTickerIds");
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isShowingStaticHeader, setIsShowingStaticHeader] = useState(false);

  const intersectionCallback: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      setIsIntersecting(entry.isIntersecting);
    });
  };

  useEffect(() => {
    if (!isIntersecting && visibleTickerIds.includes(tickerDetail.ticker_id)) {
      setIsShowingStaticHeader(true);
    } else {
      setIsShowingStaticHeader(false);
    }
  }, [
    isIntersecting,
    tickerDetail.symbol,
    tickerDetail.ticker_id,
    visibleTickerIds,
  ]);

  const { observe, unobserve } = useIntersectionObserver(
    intersectionCallback,
    0,
  );

  useEffect(() => {
    const el = elRef.current;

    if (el) {
      observe(el);

      return () => {
        unobserve(el);
      };
    }
  }, [elRef, observe, unobserve]);

  return isShowingStaticHeader;
}
