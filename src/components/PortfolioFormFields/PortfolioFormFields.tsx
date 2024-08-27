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
  const [newTicker, setNewTicker] = useState<TickerBucketTicker | null>(null);

  // Determine if the new PortfolioFormFieldsItem should be rendered
  const shouldShowNewField = !tickerBucket && newTicker === null;

  // Handle adding a new ticker field
  const handleAddField = () => {
    setNewTicker({ tickerId: 0, symbol: "", quantity: 1 }); // Default values for a new ticker
  };

  // Handle updating the new ticker field
  const handleUpdateField = (updatedTicker: TickerBucketTicker | null) => {
    setNewTicker(updatedTicker);
  };

  // Handle removing the new ticker field
  const handleRemoveField = () => {
    setNewTicker(null);
  };

  const tickerBucketTickers: TickerBucketTicker[] = tickerBucket?.tickers || [];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {
            // Render new form field if conditions are met
            shouldShowNewField && (
              <PortfolioFormFieldsItem
                initialBucketTicker={newTicker || undefined}
                onUpdate={handleUpdateField}
              />
            )
          }
          {
            // Render the new form field if a new ticker is being added
            newTicker && (
              <PortfolioFormFieldsItem
                initialBucketTicker={newTicker}
                onUpdate={handleUpdateField}
                onDelete={handleRemoveField}
              />
            )
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
                onDelete={() => handleRemoveField()}
              />
            ))
          }
          <Grid item xs={12}>
            {
              // Prevent add if there's already a new ticker being added
            }
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddField}
              disabled={!!newTicker}
            >
              Add Additional Symbol
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
