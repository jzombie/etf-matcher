import React from "react";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";

import {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import ETFAggregateDetailAppletWrap from "../components/ETFAggregateDetailAppletWrap";

export type TickerInformationAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
};

export default function TickerInformationApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
}: TickerInformationAppletProps) {
  return (
    <ETFAggregateDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      etfAggregateDetail={etfAggregateDetail}
      isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
      etfAggregateDetailError={etfAggregateDetailError}
    >
      <Scrollable style={{ textAlign: "center" }}>
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
          <InfoItem label="Sector" value={tickerDetail?.sector_name || "N/A"} />
          <InfoItem
            label="Industry"
            value={tickerDetail?.industry_name || "N/A"}
          />
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
      </Scrollable>
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
  value: string | undefined;
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
