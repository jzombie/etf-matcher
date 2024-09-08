import React from "react";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";

import { RustServiceTickerDetail } from "@utils/callRustService";

import TickerDetailAppletWrap from "../components/TickerDetailAppletWrap";

export type TickerInformationAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
};

export default function TickerInformationApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
}: TickerInformationAppletProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
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
          {
            // TODO: If ETF, add expense ratio
          }
        </InfoWrapper>
      </Scrollable>
    </TickerDetailAppletWrap>
  );
}

// Wrapper for logo
const LogoWrapper = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const InfoWrapper = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  flexWrap: "wrap", // Enable wrapping
  justifyContent: "flex-start", // Make sure items align to the left
  gap: theme.spacing(2), // Add consistent spacing between items
  "& > div": {
    flex: "0 1 30%", // Each item takes up 30% of the available width
    minWidth: "150px", // Ensure items don't shrink too small
    textAlign: "center", // Keep text centered inside each item
  },
}));

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <Box mb={2}>
      <Typography variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
