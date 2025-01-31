import React, { useCallback, useEffect, useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box, Button, Container } from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

import Section from "@components/Section";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import TickerSelectionFieldsItem from "./TickerSelectionFields.Item";

export type TickerSelectionFieldsProps = {
  tickerBucket?: TickerBucket;
  // FIXME: Rename to `onSaveStateChange`? I'm hesitant to do so because these
  // form fields do not save directly. An alternative name could be something
  // that connotates `blocking` the save state, and if used, the boolean logic
  // might need to be inverted.
  onSaveableStateChange: (isSaveable: boolean) => void;
  onDataChange: (formData: TickerBucketTicker[]) => void;
  omitShares?: boolean;
};

export default function TickerSelectionFields({
  tickerBucket,
  onSaveableStateChange,
  onDataChange,
  omitShares = false,
}: TickerSelectionFieldsProps) {
  const [newTicker, setNewTicker] = useState<TickerBucketTicker | null>(null);
  // TODO: Improve this type handling, where `string` is a ticker ID and `number` is a new field index
  const [errorFields, setErrorFields] = useState<Set<string | number>>(
    new Set(),
  );

  // Handle error state changes by adding/removing field IDs to/from the Set
  const handleErrorStateChange = useCallback(
    (fieldId: string | number, hasError: boolean) => {
      setErrorFields((prevErrors) => {
        const updatedErrors = new Set(prevErrors);
        if (hasError) {
          updatedErrors.add(fieldId);
        } else {
          updatedErrors.delete(fieldId);
        }
        return updatedErrors;
      });
    },
    [],
  );

  const handleAddNewTickerFields = useCallback(() => {
    setNewTicker({ symbol: "", quantity: 1 });
  }, []);

  const handleRemoveNewTickerFields = useCallback(() => {
    setNewTicker(null);

    // Renove `new` from error fields
    setErrorFields((prev) => {
      prev.delete("new");
      return prev;
    });
  }, []);

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
      onSaveableStateChange(errorFields.size === 0 && !newTicker);
    }
  }, [onSaveableStateChangeStableCurrentRef, newTicker, errorFields]);

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
      setNewTicker({ symbol: "", quantity: 1 });
    } else if (existingTickers.length > 0) {
      setNewTicker(null); // Ensure the new ticker field is not shown if there are existing tickers
    }
  }, [existingTickers, newTickerStableCurrentRef]);

  // Handle updating the new ticker field
  const handleUpdateField = (updatedTicker: TickerBucketTicker | null) => {
    if (updatedTicker) {
      setExistingTickers((prevTickers) => {
        const tickerIndex = prevTickers.findIndex(
          (ticker) => ticker.symbol === updatedTicker.symbol,
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
  const handleRemoveField = (tickerSymbol: string) => {
    setExistingTickers(
      existingTickers.filter((ticker) => ticker.symbol !== tickerSymbol),
    );
    setErrorFields((prevErrors) => {
      const updatedErrors = new Set(prevErrors);
      updatedErrors.delete(tickerSymbol);
      return updatedErrors;
    });
  };

  return (
    <Container maxWidth="md">
      <Section>
        <Box sx={{ my: 4 }}>
          {
            // Render existing form fields from the tickerBucket or newly added ones
            existingTickers.map((bucketTicker, idx) => (
              <TickerSelectionFieldsItem
                key={bucketTicker?.symbol || idx}
                initialBucketTicker={bucketTicker}
                existingBucketTickers={existingTickers}
                onUpdate={(updatedTicker: TickerBucketTicker | null) =>
                  handleUpdateField(updatedTicker)
                }
                onDelete={() => handleRemoveField(bucketTicker.symbol)}
                onErrorStateChange={(hasError) =>
                  handleErrorStateChange(bucketTicker?.symbol || idx, hasError)
                }
                omitShares={omitShares}
              />
            ))
          }
          {
            // Render the new form field if a new ticker is being added
            newTicker && (
              <TickerSelectionFieldsItem
                existingBucketTickers={existingTickers}
                onUpdate={handleUpdateField}
                onCancel={handleRemoveNewTickerFields}
                onErrorStateChange={(hasError) =>
                  handleErrorStateChange(newTicker.symbol || -1, hasError)
                }
                omitShares={omitShares}
              />
            )
          }
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddNewTickerFields}
              disabled={!!newTicker}
            >
              Add Additional Symbol
            </Button>
          </Box>
        </Box>
      </Section>
    </Container>
  );
}
