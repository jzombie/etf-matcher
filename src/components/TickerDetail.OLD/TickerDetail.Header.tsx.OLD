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
      {/* Static header display when scrolled */}
      {isShowingStaticHeader && (
        <TickerDetailStaticHeader tickerDetail={tickerDetail} />
      )}

      {/* Main header content */}
      <SymbolDetailWrapper ref={elRef}>
        {/* Logo Section */}
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

        {/* Info Section */}
        <InfoContainer>
          <Padding>
            <Grid container spacing={2}>
              {/* Left Column: Company, Sector */}
              <Grid item xs={12} md={6}>
                <InfoItem
                  label="Company"
                  value={`${tickerDetail?.company_name} (${formattedSymbolWithExchange})`}
                />
                <InfoItem
                  label="Sector"
                  value={
                    etfAggregateDetail?.top_market_value_sector_name ||
                    tickerDetail?.sector_name ||
                    "N/A"
                  }
                />
              </Grid>

              {/* Right Column: Industry, ETF Status */}
              <Grid item xs={12} md={6}>
                <InfoItem
                  label="Industry"
                  value={
                    etfAggregateDetail?.top_market_value_industry_name ||
                    tickerDetail?.industry_name ||
                    "N/A"
                  }
                />
                <InfoItem
                  label="ETF Status"
                  value={tickerDetail?.is_etf ? "ETF" : "Not ETF"}
                />
                {etfAggregateDetail?.expense_ratio && (
                  <InfoItem
                    label="Expense Ratio"
                    value={`${etfAggregateDetail.expense_ratio.toFixed(2)}%`}
                  />
                )}
              </Grid>
            </Grid>
          </Padding>
        </InfoContainer>
      </SymbolDetailWrapper>
    </>
  );
}

/**
 * InfoItem is a reusable component that takes in label and value props
 * and renders them in a styled box.
 */
function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <Box mb={1}>
      <Typography variant="subtitle2" fontWeight="bold" component="div">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

/**
 * Styled components for layout improvements.
 */

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

/**
 * Hook to determine when the header should switch to a static version.
 */
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
