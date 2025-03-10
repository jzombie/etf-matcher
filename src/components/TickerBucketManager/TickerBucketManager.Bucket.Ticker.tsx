import React, { useCallback, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid2,
  Typography,
} from "@mui/material";

import { DEFAULT_COUNTRY_CODE } from "@src/constants";
import type { TickerBucket, TickerBucketTicker } from "@src/store";
import store, { tickerBucketDefaultNames } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";
import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import Section from "@components/Section";

import useTickerDetail from "@hooks/useTickerDetail";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

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

export type TickerBucketTickerProps = {
  bucketTicker: TickerBucketTicker;
  tickerBucket: TickerBucket;
};

export default function TickerBucketTicker({
  bucketTicker,
  tickerBucket,
}: TickerBucketTickerProps) {
  const { isLoadingTickerDetail, tickerDetail, tickerDetailError } =
    useTickerDetail(bucketTicker.symbol);

  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    store.removeTickerFromBucket(bucketTicker.symbol, tickerBucket);
  }, [bucketTicker, tickerBucket]);

  const navigateToSymbol = useTickerSymbolNavigation();

  if (isLoadingTickerDetail) {
    return <CircularProgress />;
  }

  if (tickerDetailError) {
    return <Alert color="error">Could not load ticker detail.</Alert>;
  }

  if (!tickerDetail) {
    return (
      // FIXME: The delayed fade-in is a workaround for this element briefly
      // flashing in. I tried various ways of updating `useTickerDetail` itself
      // to try to prevent this from briefly appearing and came to the
      // conclusion that setting an object for the state, where multiple keys
      // can be set at once, might be necessary to prevent this from happening.
      //
      // Alternatively, perhaps setting `tickerDetail` before `isLoadingTickerDetail`
      // could potentially be a workaround.
      <div className="animate__animated animate__fadeIn animate__delay-1s">
        No data available
      </div>
    );
  }

  return (
    <Box my={1}>
      <Section>
        <Grid2
          container
          spacing={2}
          alignItems="center"
          sx={{ cursor: "pointer" }}
          onClick={() => navigateToSymbol(bucketTicker.symbol)}
        >
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <Box display="flex" alignItems="center">
              <AvatarLogo tickerDetail={tickerDetail} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#ffffff", ml: 2 }}
              >
                {tickerDetail.ticker_symbol}
              </Typography>
            </Box>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Exchange">
              {tickerDetail.exchange_short_name || "N/A"}
            </InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Company Name">
              {tickerDetail.company_name}
            </InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="CIK">{tickerDetail.cik}</InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Country Code">
              {tickerDetail.country_code || DEFAULT_COUNTRY_CODE}
            </InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Industry">
              {tickerDetail.industry_name || "N/A"}
            </InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Sector">
              {tickerDetail.sector_name || "N/A"}
            </InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Is ETF">
              {tickerDetail.is_etf ? "Yes" : "No"}
            </InfoItem>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Is Held in ETF">
              {tickerDetail.is_held_in_etf ? "Yes" : "No"}
            </InfoItem>
          </Grid2>
          {/*
          // Note: This is currently intentionally commented-out at this time
          // due to: https://linear.app/zenosmosis/issue/ZEN-23/remove-durability-metric-rating.
          // It will likely be integrated again later once the calculation
          // method is updated.
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Score Avg DCA">
              {tickerDetail.score_avg_dca?.toFixed(2) || "N/A"}
            </InfoItem>
          </Grid2>
          */}
        </Grid2>

        {/* Delete Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            color="error"
            onClick={handleOpen}
            startIcon={<DeleteIcon />} // Add the Delete icon here
            sx={{ margin: 1 }}
          >
            Delete
          </Button>

          <Button
            variant="contained"
            onClick={() => navigateToSymbol(bucketTicker.symbol)}
            sx={{ margin: 1 }}
          >
            View
          </Button>
        </Box>

        <DeleteEntityDialogModal
          open={open}
          onClose={handleClose}
          onCancel={handleClose}
          onDelete={handleDelete}
          title={"Delete Item"}
          content={
            <>
              Are you sure you want to delete &quot;{bucketTicker.symbol}&quot;
              from the{" "}
              {tickerBucketDefaultNames[tickerBucket.type].toLowerCase()} &quot;
              {tickerBucket.name}&quot;? This action cannot be undone.
            </>
          }
        />
      </Section>
    </Box>
  );
}
