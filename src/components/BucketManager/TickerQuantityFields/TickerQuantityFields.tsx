import React, { useEffect, useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box, Button, Container, Grid } from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import TickerQuantityFieldsItem from "./TickerQuantityFields.Item";

export type TickerQuantityFieldsProps = {
  tickerBucket?: TickerBucket;
  // FIXME: Rename to `onSaveStateChange`? I'm hesitant to do so because these
  // form fields do not save directly. An alternative name could be something
  // that connotates `blocking` the save state, and if used, the boolean logic
  // might need to be inverted.
  onSaveableStateChange: (isSaveable: boolean) => void;
  onDataChange: (formData: TickerBucketTicker[]) => void;
  omitShares?: boolean;
};

// TODO: Fix issue where if editing the form, and adding a new field, the form cannot
// be saved unless filling out that field
export default function TickerQuantityFields({
  tickerBucket,
  onSaveableStateChange,
  onDataChange,
  omitShares = false,
}: TickerQuantityFieldsProps) {
  const [newTicker, setNewTicker] = useState<TickerBucketTicker | null>(null);
  const [existingTickers, setExistingTickers] = useState<TickerBucketTicker[]>(
    [],
  );

  const onSaveableStateChangeStableCurrentRef = useStableCurrentRef(
    onSaveableStateChange,
  );
  const onDataChangeStableCurrentRef = useStableCurrentRef(onDataChange);

  useEffect(() => {
    const onDataChange = onDataChangeStableCurrentRef.current;
    if (typeof onDataChange === "function") {
      onDataChange(existingTickers);
    }
  }, [existingTickers, onDataChangeStableCurrentRef]);

  // Handle `saveable` state changes
  useEffect(() => {
    const onSaveableStateChange = onSaveableStateChangeStableCurrentRef.current;

    if (typeof onSaveableStateChange === "function") {
      onSaveableStateChange(!newTicker);
    }
  }, [onSaveableStateChangeStableCurrentRef, newTicker]);

  // Initialize existing tickers from the tickerBucket prop
  useEffect(() => {
    if (tickerBucket?.tickers) {
      setExistingTickers(tickerBucket.tickers);
    }
  }, [tickerBucket]);

  const newTickerStableCurrentRef = useStableCurrentRef(newTicker);

  // Show the new ticker field by default only if there are no existing tickers
  useEffect(() => {
    // Note: This fixes an issue where clicking on `Add Additional Symbol` would
    // rapidly show and then hide the new ticker fields
    const newTicker = newTickerStableCurrentRef.current;

    if (existingTickers.length === 0 && !newTicker) {
      setNewTicker({ tickerId: 0, symbol: "", quantity: 1 });
    } else if (existingTickers.length > 0) {
      setNewTicker(null); // Ensure the new ticker field is not shown if there are existing tickers
    }
  }, [existingTickers, newTickerStableCurrentRef]);

  // Handle updating the new ticker field
  const handleUpdateField = (updatedTicker: TickerBucketTicker | null) => {
    if (updatedTicker) {
      setExistingTickers((prevTickers) => {
        const tickerIndex = prevTickers.findIndex(
          (ticker) => ticker.tickerId === updatedTicker.tickerId,
        );

        if (tickerIndex !== -1) {
          // Update the existing ticker
          const updatedTickers = [...prevTickers];
          updatedTickers[tickerIndex] = updatedTicker;
          return updatedTickers;
        } else {
          // Add a new ticker
          return [...prevTickers, updatedTicker];
        }
      });

      setNewTicker(null); // Clear the new ticker field after it's added or updated
    }
  };

  // Handle removing an existing ticker
  const handleRemoveField = (tickerId: number) => {
    setExistingTickers(
      existingTickers.filter((ticker) => ticker.tickerId !== tickerId),
    );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {
            // Render existing form fields from the tickerBucket or newly added ones
            existingTickers.map((bucketTicker, idx) => (
              <TickerQuantityFieldsItem
                key={bucketTicker?.tickerId || idx}
                initialBucketTicker={bucketTicker}
                existingBucketTickers={existingTickers}
                onUpdate={(updatedTicker: TickerBucketTicker | null) =>
                  handleUpdateField(updatedTicker)
                }
                onDelete={() => handleRemoveField(bucketTicker.tickerId)}
                omitShares={omitShares}
              />
            ))
          }
          {
            // Render the new form field if a new ticker is being added
            newTicker && (
              <TickerQuantityFieldsItem
                existingBucketTickers={existingTickers}
                onUpdate={handleUpdateField}
                onDelete={() => setNewTicker(null)}
                omitShares={omitShares}
              />
            )
          }
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() =>
                setNewTicker({ tickerId: 0, symbol: "", quantity: 1 })
              }
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
