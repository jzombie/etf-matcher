import React, { useMemo } from "react";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";

import {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import TickerViewWindowManagerBucketManager from "../TickerViewWindowManager.BucketManager";
import ETFAggregateDetailAppletWrap from "../components/ETFAggregateDetailAppletWrap";

export type TickerInformationAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
  isTiling: boolean;
};

export default function TickerInformationApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  isTiling,
}: TickerInformationAppletProps) {
  const formattedSector = useMemo(() => {
    const base = tickerDetail?.sector_name;

    if (!base) {
      return <>N/A</>;
    }

    if (etfAggregateDetail?.top_pct_sector_name) {
      return (
        <>
          {base}
          <br />({etfAggregateDetail?.top_pct_sector_name})
        </>
      );
    }

    return <>base</>;
  }, [tickerDetail, etfAggregateDetail]);

  const formattedIndustry = useMemo(() => {
    const base = tickerDetail?.industry_name;

    if (!base) {
      return <>N/A</>;
    }

    if (etfAggregateDetail?.top_pct_industry_name) {
      return (
        <>
          {base}
          <br />({etfAggregateDetail?.top_pct_industry_name})
        </>
      );
    }

    return <>{base}</>;
  }, [tickerDetail, etfAggregateDetail]);

  return (
    <ETFAggregateDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      etfAggregateDetail={etfAggregateDetail}
      isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
      etfAggregateDetailError={etfAggregateDetailError}
      isTiling={isTiling}
    >
      <Scrollable style={{ textAlign: "center" }}>
        <Padding>
          {/* Logo Section */}
          <LogoWrapper>
            <EncodedImage
              encSrc={tickerDetail?.logo_filename}
              title={`${tickerDetail?.symbol} logo`}
              style={{
                width: "100%",
                maxWidth: "80px",
                objectFit: "contain",
              }}
            />
          </LogoWrapper>

          {/* Information Section */}

          <InfoWrapper>
            {
              // TODO: If ETF, add top sector/industry information
            }
            <InfoItem
              label="Symbol"
              value={`${tickerDetail?.symbol}${tickerDetail?.exchange_short_name ? ` (${tickerDetail.exchange_short_name})` : ""}`}
            />
            <InfoItem
              label="Company"
              value={tickerDetail?.company_name || "N/A"}
            />
            <InfoItem label="Sector" value={formattedSector} />
            <InfoItem label="Industry" value={formattedIndustry} />
            {tickerDetail?.is_etf && (
              <InfoItem
                label="Expense Ratio"
                value={
                  etfAggregateDetail?.expense_ratio
                    ? `${etfAggregateDetail.expense_ratio.toFixed(2)}%`
                    : "N/A"
                }
              />
            )}
            {
              // TODO: Add asset class, etc.
            }
          </InfoWrapper>
        </Padding>
      </Scrollable>
      {!isTiling && tickerDetail && (
        <TickerViewWindowManagerBucketManager tickerDetail={tickerDetail} />
      )}
    </ETFAggregateDetailAppletWrap>
  );
}

// Wrapper for logo
const LogoWrapper = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "16px",
}));

// Flexbox-based wrapper for the information section
const InfoWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap", // Allow wrapping when the container is too small
  textAlign: "center",
  gap: theme.spacing(2), // Consistent spacing between items
  padding: theme.spacing(2), // Padding around the content
}));

// InfoItem component for individual pieces of information
function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | JSX.Element | React.ReactNode | undefined;
}) {
  return (
    <Box flex="1 1 150px">
      {" "}
      {/* Flex item with a minimum width of 150px */}
      <Typography variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
