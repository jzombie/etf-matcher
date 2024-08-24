import React from "react";

import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import useTickerDetail from "@hooks/useTickerDetail";

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
        padding: 3,
        margin: 2,
        backgroundColor: "#2b2b2b",
        borderRadius: 2,
      }}
    >
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Symbol:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.symbol}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Exchange:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.exchange_short_name || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Company Name:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.company_name}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            CIK:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.cik}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Country Code:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.country_code}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Industry:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.industry_name || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Sector:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.sector_name || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Is ETF:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.is_etf ? "Yes" : "No"}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Is Held in ETF:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.is_held_in_etf ? "Yes" : "No"}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Score Avg DCA:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.score_avg_dca?.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 250px", minWidth: "200px", padding: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Logo:
          </Typography>
          <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
            {tickerDetail.logo_filename || "N/A"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
