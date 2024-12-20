import React, { useCallback, useEffect, useMemo, useState } from "react";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, TextField, Typography } from "@mui/material";

import { MIN_TICKER_BUCKET_NAME_LENGTH } from "@src/constants";
import store, {
  TickerBucketNameError,
  tickerBucketDefaultNames,
} from "@src/store";
import type { TickerBucket, TickerBucketTicker } from "@src/store";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import TickerSelectionFields from "./TickerSelectionFields";

export type TickerBucketFormProps = {
  bucketType: TickerBucket["type"];
  existingBucket?: TickerBucket;
  onClose?: () => void;
  onCancel?: () => void;
  disableTickerSelectionFields?: boolean;
};

export default function TickerBucketForm({
  bucketType,
  existingBucket,
  onClose,
  onCancel,
  disableTickerSelectionFields = false,
}: TickerBucketFormProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const initialBucketName = useMemo(
    () => existingBucket?.name,
    [existingBucket],
  );

  const [isPortfolioSaveBlocked, setIsPortfolioSaveBlocked] =
    useState<boolean>(false);

  const [bucketName, setBucketName] = useState<string>("");
  const [bucketDescription, setBucketDescription] = useState<string>("");
  const [isShowingDescription, setIsShowingDescription] = useState<boolean>(
    Boolean(existingBucket?.description),
  );
  const [explicitTickers, setExplicitTickers] = useState<
    TickerBucketTicker[] | undefined
  >(undefined);

  const [nameError, setNameError] = useState<string | null>(null);

  // Validate name as it is typed
  useEffect(() => {
    // Skip annoying errors on first few characters;
    // these will be fully validated on submit, anyway
    if (bucketName.length < MIN_TICKER_BUCKET_NAME_LENGTH) {
      setNameError("");
    } else {
      let errMsg = "";

      try {
        store.validateTickerBucketName(
          bucketName,
          bucketType,
          initialBucketName,
        );
      } catch (err) {
        if (err instanceof TickerBucketNameError) {
          errMsg = err.message;
        }
      } finally {
        setNameError(errMsg);
      }
    }
  }, [bucketName, bucketType, initialBucketName]);

  useEffect(() => {
    if (existingBucket) {
      setBucketName(existingBucket.name);
      setBucketDescription(existingBucket.description);
    }
  }, [existingBucket]);

  const handleSaveBucket = useCallback(() => {
    try {
      if (existingBucket) {
        const nextBucket = { ...existingBucket };

        if (explicitTickers) {
          nextBucket["tickers"] = explicitTickers;
        }

        store.updateTickerBucket(existingBucket, {
          ...nextBucket,
          name: bucketName,
          description: bucketDescription,
        });
      } else {
        store.createTickerBucket({
          name: bucketName,
          type: bucketType,
          tickers: explicitTickers || [],
          description: bucketDescription,
          isUserConfigurable: true,
        });
      }

      // Reset fields and close the form if successful
      setBucketName("");
      setBucketDescription("");

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (err) {
      if (err instanceof TickerBucketNameError) {
        setNameError(err.message);

        // Note: Intentionally routing the error message to the UI in this case
        triggerUIError(err);
      }
    }
  }, [
    bucketType,
    bucketName,
    bucketDescription,
    explicitTickers,
    existingBucket,
    onClose,
    triggerUIError,
  ]);

  const handleCancel = useCallback(() => {
    setBucketName("");
    setBucketDescription("");

    if (typeof onClose === "function") {
      onClose();
    }

    if (typeof onCancel === "function") {
      onCancel();
    }
  }, [onClose, onCancel]);

  const isFormValid = !nameError && bucketName.trim() !== "";

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">
        {existingBucket ? "Edit" : "Add New"}{" "}
        {tickerBucketDefaultNames[bucketType]}
      </Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveBucket();
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label={`${tickerBucketDefaultNames[bucketType]} Name`}
            value={bucketName}
            onChange={(e) => {
              setBucketName(e.target.value);
            }}
            variant="outlined"
            fullWidth
            required
            error={!!nameError}
            helperText={nameError}
          />
          {isShowingDescription && (
            <TextField
              label={`${tickerBucketDefaultNames[bucketType]} Description`}
              value={bucketDescription}
              onChange={(e) => setBucketDescription(e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
            />
          )}

          <Button
            onClick={() => setIsShowingDescription((prev) => !prev)}
            endIcon={
              !isShowingDescription ? <ExpandMoreIcon /> : <ExpandLessIcon />
            }
          >
            {isShowingDescription ? "Hide" : "Show"} Description Field
          </Button>

          {!disableTickerSelectionFields && (
            <TickerSelectionFields
              tickerBucket={existingBucket}
              onSaveableStateChange={(isSaveable) =>
                setIsPortfolioSaveBlocked(!isSaveable)
              }
              onDataChange={setExplicitTickers}
              omitShares={bucketType !== "portfolio"}
            />
          )}

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={!isFormValid || isPortfolioSaveBlocked}
            >
              Save {tickerBucketDefaultNames[bucketType]}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
