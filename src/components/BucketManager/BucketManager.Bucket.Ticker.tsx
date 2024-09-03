import React, { useCallback, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import { DEFAULT_COUNTRY_CODE } from "@src/constants";
import type { TickerBucket, TickerBucketTicker } from "@src/store";
import store, { tickerBucketDefaultNames } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";
import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";

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

export type BucketTickerProps = {
  bucketTicker: TickerBucketTicker;
  tickerBucket: TickerBucket;
};

export default function BucketTicker({
  bucketTicker,
  tickerBucket,
}: BucketTickerProps) {
  const { isLoadingTickerDetail, tickerDetail, tickerDetailError } =
    useTickerDetail(bucketTicker.tickerId);

  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    store.removeTickerFromBucket(bucketTicker.tickerId, tickerBucket);
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
    <Paper
      sx={{
        padding: 2,
        margin: 2,
        backgroundColor: "#2b2b2b",
        borderRadius: 2,
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{ cursor: "pointer" }}
        onClick={() => navigateToSymbol(bucketTicker.symbol)}
      >
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
          <InfoItem label="Country Code">
            {tickerDetail.country_code || DEFAULT_COUNTRY_CODE}
          </InfoItem>
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
            {tickerDetail.score_avg_dca?.toFixed(2) || "N/A"}
          </InfoItem>
        </Grid>
      </Grid>

      {/* Delete Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          color="error"
          onClick={handleOpen}
          startIcon={<DeleteIcon />} // Add the Delete icon here
        >
          Delete from Bucket
        </Button>

        <Button
          variant="contained"
          onClick={() => navigateToSymbol(bucketTicker.symbol)}
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
            from the {tickerBucketDefaultNames[tickerBucket.type].toLowerCase()}{" "}
            &quot;
            {tickerBucket.name}&quot;? This action cannot be undone.
          </>
        }
      />
    </Paper>
  );
}
