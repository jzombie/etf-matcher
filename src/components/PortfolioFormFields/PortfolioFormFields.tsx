import React from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box, Button, Container, Grid } from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

import customLogger from "@utils/customLogger";

import PortfolioFormFieldsItem from "./PortfolioFormFields.Item";

export type PortfolioFormFieldsProps = {
  tickerBucket?: TickerBucket;
};

export default function PortfolioFormFields({
  tickerBucket,
}: PortfolioFormFieldsProps) {
  // TODO: Handle
  // const handleAddFields = () => {
  //   setAssets([...assets, { symbol: "", shares: 1 }]);
  // };

  // TODO: Handle
  // const handleRemoveFields = (index: number) => {
  //   const values = [...assets];
  //   values.splice(index, 1);
  //   setAssets(values);
  // };

  // TODO: Handle
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
            // TODO: Determine if should render, first
            // Render new form fields
          }
          <PortfolioFormFieldsItem
            onUpdate={(bucketTicker) =>
              // TODO: Handle
              customLogger.debug({ bucketTicker })
            }
          />
          {
            // Render existing form fields
            tickerBucketTickers.map((bucketTicker, idx) => (
              <PortfolioFormFieldsItem
                key={bucketTicker?.tickerId || idx}
                initialBucketTicker={bucketTicker}
                onUpdate={(bucketTicker) =>
                  // TODO: Handle
                  customLogger.debug({ bucketTicker })
                }
              />
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
