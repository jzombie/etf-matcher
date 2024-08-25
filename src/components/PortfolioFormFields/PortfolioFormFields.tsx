/* eslint-disable */
import React, { useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box, Button, Container, Grid } from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

import BucketTicker from "@components/BucketManager/BucketManager.Bucket.Ticker";

import PortfolioFormFieldsItem from "./PortfolioFormFields.Item";

export type PortfolioFormFieldsProps = {
  tickerBucket?: TickerBucket;
};

export default function PortfolioFormFields({
  tickerBucket,
}: PortfolioFormFieldsProps) {
  // const handleAddFields = () => {
  //   setAssets([...assets, { symbol: "", shares: 1 }]);
  // };

  // const handleRemoveFields = (index: number) => {
  //   const values = [...assets];
  //   values.splice(index, 1);
  //   setAssets(values);
  // };

  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   console.log("Form Data:", assets);
  // };

  // TODO: Improve this
  const tickerBucketTickers: TickerBucketTicker[] = tickerBucket?.tickers || [];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {
            // Render new form fields
          }
          <PortfolioFormFieldsItem />
          {
            // Render existing form fields
            tickerBucketTickers.map((bucketTicker, idx) => (
              <PortfolioFormFieldsItem key={bucketTicker?.tickerId || idx} />
            ))
          }
          <Grid item xs={12}>
            {
              // TODO: Prevent add unless no current symbol is being edited, and there is at least one populated symbol
            }
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              // onClick={handleAddFields}
              disabled
            >
              Add Additional Symbol
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
