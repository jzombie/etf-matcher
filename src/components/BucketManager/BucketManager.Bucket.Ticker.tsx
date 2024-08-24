import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";

import useTickerDetail from "@hooks/useTickerDetail";

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

{
  // TODO: Finish wiring up `Delete` button and update the text accordingly
  // TODO: Add button to navigate to the full symbol
}

export default function BucketTicker({ bucketTicker }: BucketTickerProps) {
  const { isLoadingTickerDetail, tickerDetail } = useTickerDetail(
    bucketTicker.tickerId,
  );

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

      {/* Delete Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleClickOpen}
          startIcon={<DeleteIcon />} // Add the Delete icon here
        >
          Delete from Bucket
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Item"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this item from the bucket? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
