import React, { useCallback, useEffect, useMemo, useState } from "react";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Grid2, IconButton, TextField } from "@mui/material";

import { RustServiceTickerSearchResult } from "@services/RustService";
import type { TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";
import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import TickerSearchModal from "@components/TickerSearchModal";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useTickerDetail from "@hooks/useTickerDetail";

import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";
import removeCommas from "@utils/string/removeCommas";

export type TickerSelectionFieldsItemProps = {
  initialBucketTicker?: TickerBucketTicker;
  existingBucketTickers: TickerBucketTicker[];
  onUpdate: (bucketTicker: TickerBucketTicker | null) => void;
  onDelete?: (bucketTicker: TickerBucketTicker) => void;
  onCancel?: () => void;
  onErrorStateChange: (hasError: boolean) => void;
  omitShares?: boolean;
};

export default function TickerSelectionFieldsItem({
  initialBucketTicker,
  onUpdate,
  onDelete,
  onCancel,
  onErrorStateChange,
  existingBucketTickers = [],
  omitShares = false,
}: TickerSelectionFieldsItemProps) {
  const onUpdateStableRef = useStableCurrentRef(onUpdate);
  const onDeleteStableRef = useStableCurrentRef(onDelete);
  const onCancelStableRef = useStableCurrentRef(onCancel);
  const onErrorStateChangeStableRef = useStableCurrentRef(onErrorStateChange);

  const [bucketTicker, _setBucketTicker] = useState<
    TickerBucketTicker | undefined | null
  >(initialBucketTicker);

  const [quantityInputValue, setQuantityInputValue] = useState<string>(
    bucketTicker?.quantity
      ? bucketTicker.quantity.toString() // Start with the raw value
      : "",
  );
  const formattedQuantityInputValue = useMemo(() => {
    // Split the value into integer and fractional parts
    const [integerPart, fractionalPart] = quantityInputValue.split(".");

    // Format the integer part with commas
    const formattedInteger = formatNumberWithCommas(integerPart);

    // Reconstruct the full value
    const formattedValue =
      fractionalPart !== undefined
        ? `${formattedInteger}.${fractionalPart}`
        : formattedInteger;

    return formattedValue;
  }, [quantityInputValue]);

  const { tickerDetail } = useTickerDetail(bucketTicker?.tickerId);
  const [tickerError, setTickerError] = useState<string | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Handle `onErrorStateChange` callback
  useEffect(() => {
    const onErrorStateChange = onErrorStateChangeStableRef.current;

    if (typeof onErrorStateChange === "function") {
      onErrorStateChange(Boolean(tickerError));
    }
  }, [tickerError, onErrorStateChangeStableRef]);

  const handleSetBucketTicker = useCallback(
    (bucketTicker: TickerBucketTicker | null) => {
      if (
        bucketTicker &&
        bucketTicker.tickerId !== initialBucketTicker?.tickerId &&
        existingBucketTickers.some(
          (existingTicker) => existingTicker.tickerId === bucketTicker.tickerId,
        )
      ) {
        setTickerError("This ticker is already in your portfolio.");
      } else {
        setTickerError(null);
        _setBucketTicker(bucketTicker);

        const onUpdate = onUpdateStableRef.current;
        onUpdate(bucketTicker);
      }
    },
    [existingBucketTickers, initialBucketTicker, onUpdateStableRef],
  );

  const handleQuantityInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();

      // Remove commas for processing
      const rawValue = removeCommas(value);

      // Allow only valid numeric input, including decimals
      if (!/^\d*\.?\d*$/.test(rawValue)) {
        setTickerError("Invalid number format");
        return;
      }

      setTickerError(null);

      setQuantityInputValue(rawValue);

      if (bucketTicker && rawValue) {
        const numericValue = parseFloat(rawValue);
        handleSetBucketTicker({
          ...bucketTicker,
          quantity: numericValue,
        });
      }
    },
    [bucketTicker, handleSetBucketTicker],
  );

  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const handleSelectTicker = useCallback(
    (tickerSearchResult: RustServiceTickerSearchResult) => {
      setIsSearchModalOpen(false);

      handleSetBucketTicker({
        tickerId: tickerSearchResult.ticker_id,
        symbol: tickerSearchResult.symbol,
        exchangeShortName: tickerSearchResult.exchange_short_name,
        quantity: 1,
      });
    },
    [handleSetBucketTicker],
  );

  const handleDeleteConfirm = useCallback(() => {
    const onDelete = onDeleteStableRef.current;
    const onCancel = onCancelStableRef.current;

    if (bucketTicker && typeof onDelete === "function") {
      onDelete(bucketTicker);
    } else if (typeof onCancel === "function") {
      onCancel();
    }
    setIsDeleteConfirmOpen(false);
  }, [bucketTicker, onDeleteStableRef, onCancelStableRef]);

  const handleDelete = useCallback(() => {
    if (bucketTicker) {
      setIsDeleteConfirmOpen(true); // Open the delete confirmation dialog
    } else {
      // If no bucket ticker, proceed directly to delete
      //
      // This condition would be invoked if the user initially wants to add a new
      // ticker field but then decides to cancel it
      handleDeleteConfirm();
    }
  }, [bucketTicker, handleDeleteConfirm]);

  const isDeleteButtonDisabled = !bucketTicker && !existingBucketTickers.length;

  const disabledSearchTickerIds = useMemo(
    () => existingBucketTickers.map((ticker) => ticker.tickerId),
    [existingBucketTickers],
  );

  return (
    <>
      {/** Company Logo */}
      <Grid2 container spacing={2} mb={1}>
        <Grid2 size={{ xs: 12, sm: 1 }}>
          <AvatarLogo tickerDetail={tickerDetail} />
        </Grid2>

        {/** Symbol Input */}
        <Grid2 size={{ xs: 12, sm: !omitShares ? 3 : 10 }}>
          <TextField
            name="symbol_or_company_name"
            label="Symbol"
            variant="outlined"
            fullWidth
            required
            value={bucketTicker?.symbol || ""}
            disabled={Boolean(bucketTicker)}
            onChange={() => setIsSearchModalOpen(true)}
            onClick={() => setIsSearchModalOpen(true)}
            error={Boolean(tickerError)}
            helperText={tickerError}
            size="small"
          />
        </Grid2>

        {/** Quantity Input */}
        {!omitShares && (
          <Grid2 size={{ xs: 12, sm: 7 }}>
            <TextField
              name="shares"
              label="Shares"
              variant="outlined"
              fullWidth
              required
              type="text"
              value={formattedQuantityInputValue}
              onChange={handleQuantityInputChange}
              disabled={!bucketTicker}
              size="small"
            />
          </Grid2>
        )}

        {/* Delete Button */}
        {existingBucketTickers.length > 0 && (
          <Grid2
            size={{
              xs: 12,
              sm: 1,
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-end", sm: "flex-start" },
            }}
          >
            <IconButton
              disabled={isDeleteButtonDisabled}
              onClick={handleDelete}
              aria-label="delete"
              data-testid={`delete-button${bucketTicker?.symbol ? `--${bucketTicker.symbol}` : ""}`}
            >
              <RemoveCircleOutlineIcon
                color={isDeleteButtonDisabled ? "disabled" : "error"}
              />
            </IconButton>
          </Grid2>
        )}
      </Grid2>

      {/* Ticker Search Modal */}
      <TickerSearchModal
        open={isSearchModalOpen}
        onSelectTicker={handleSelectTicker}
        onCancel={() => setIsSearchModalOpen(false)}
        disabledTickerIds={disabledSearchTickerIds}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEntityDialogModal
        open={isDeleteConfirmOpen}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onDelete={handleDeleteConfirm}
        title="Confirm Delete"
        // FIXME: Ideally, it should relay the bucket name and type as well
        content={
          !bucketTicker
            ? "Are you sure you want to remove this ticker?"
            : `Are you sure you want to remove "${bucketTicker.symbol}"?`
        }
      />
    </>
  );
}
