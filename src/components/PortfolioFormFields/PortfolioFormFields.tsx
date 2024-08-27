import React, { useState } from "react";

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
  const [pendingTickers, setPendingTickers] = useState<
    (TickerBucketTicker | null)[]
  >([]);

  // Determine if the new PortfolioFormFieldsItem should be rendered
  const shouldShowNewField = !tickerBucket && pendingTickers.length === 0;

  // Handle adding a new ticker field
  const handleAddFields = () => {
    setPendingTickers([
      ...pendingTickers,
      { tickerId: 0, symbol: "", quantity: 1 }, // Default values for a new ticker
    ]);
  };

  // Handle updating a ticker field, handling the case where it might be null
  const handleUpdateFields = (
    index: number,
    updatedTicker: TickerBucketTicker | null,
  ) => {
    const updatedTickers = [...pendingTickers];

    if (updatedTicker) {
      updatedTickers[index] = updatedTicker;
    } else {
      // If the updatedTicker is null, we may want to remove or reset the field
      updatedTickers[index] = { tickerId: 0, symbol: "", quantity: 1 };
    }

    setPendingTickers(updatedTickers);
  };

  // Handle removing a ticker field
  const handleRemoveFields = (index: number) => {
    const values = [...pendingTickers];
    values.splice(index, 1);
    setPendingTickers(values);
  };

  const tickerBucketTickers: TickerBucketTicker[] = tickerBucket?.tickers || [];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {
            // Render new form fields if conditions are met
            shouldShowNewField && (
              <PortfolioFormFieldsItem
                onUpdate={(bucketTicker: TickerBucketTicker | null) =>
                  handleUpdateFields(0, bucketTicker)
                }
              />
            )
          }
          {
            // Render pending form fields
            pendingTickers.map((bucketTicker, idx) => (
              <PortfolioFormFieldsItem
                key={bucketTicker?.tickerId || idx}
                initialBucketTicker={bucketTicker || undefined}
                onUpdate={(updatedTicker: TickerBucketTicker | null) =>
                  handleUpdateFields(idx, updatedTicker)
                }
                // TODO: Implement
                // onRemove={() => handleRemoveFields(idx)}
              />
            ))
          }
          {
            // Render existing form fields from the tickerBucket
            tickerBucketTickers.map((bucketTicker, idx) => (
              <PortfolioFormFieldsItem
                key={bucketTicker?.tickerId || idx}
                initialBucketTicker={bucketTicker}
                onUpdate={(updatedTicker: TickerBucketTicker | null) =>
                  // TODO: Handle
                  customLogger.debug({ updatedTicker })
                }
              />
            ))
          }
          <Grid item xs={12}>
            {
              // Prevent add unless there is no empty or pending symbol
            }
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddFields}
              disabled={pendingTickers.length > 0}
            >
              Add Additional Symbol
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
