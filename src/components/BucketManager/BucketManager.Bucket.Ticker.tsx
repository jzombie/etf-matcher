import React from "react";

import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";

import useTickerDetail from "@hooks/useTickerDetail";

// Custom component for consistent styling
const InfoItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ minWidth: "200px", padding: 1 }}>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: "bold", color: "#ffffff" }}
    >
      {label}:
    </Typography>
    <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
      {children}
    </Typography>
  </Box>
);

export type BucketTickerProps = {
  bucketTicker: TickerBucketTicker;
};

export default function BucketTicker({ bucketTicker }: BucketTickerProps) {
  const { isLoadingTickerDetail, tickerDetail } = useTickerDetail(
    bucketTicker.tickerId,
  );

  if (isLoadingTickerDetail) {
    return <CircularProgress />;
  }

  if (!tickerDetail) {
    return <div>No data available</div>;
  }

  return (
    <Paper
      sx={{
        padding: 2,
        margin: 2,
        backgroundColor: "#2b2b2b",
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <Box display="flex" alignItems="center">
            <AvatarLogo tickerDetail={tickerDetail} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#ffffff", ml: 2 }}
            >
              {tickerDetail.symbol}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Exchange">
            {tickerDetail.exchange_short_name || "N/A"}
          </InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Company Name">{tickerDetail.company_name}</InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="CIK">{tickerDetail.cik}</InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Country Code">{tickerDetail.country_code}</InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Industry">
            {tickerDetail.industry_name || "N/A"}
          </InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Sector">
            {tickerDetail.sector_name || "N/A"}
          </InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Is ETF">
            {tickerDetail.is_etf ? "Yes" : "No"}
          </InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Is Held in ETF">
            {tickerDetail.is_held_in_etf ? "Yes" : "No"}
          </InfoItem>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoItem label="Score Avg DCA">
            {tickerDetail.score_avg_dca?.toFixed(2)}
          </InfoItem>
        </Grid>
      </Grid>
    </Paper>
  );
}
