import React, { useCallback, useEffect, useMemo, useState } from "react";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Grid2, IconButton, TextField } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";
import TickerSearchModal from "@components/TickerSearchModal";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useTickerDetail from "@hooks/useTickerDetail";

import { RustServiceTickerSearchResult } from "@utils/callRustService";
import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";
import removeCommas from "@utils/string/removeCommas";

export type TickerQuantityFieldsItemProps = {
  initialBucketTicker?: TickerBucketTicker;
  existingBucketTickers: TickerBucketTicker[];
  onUpdate: (bucketTicker: TickerBucketTicker | null) => void;
  onDelete?: (bucketTicker: TickerBucketTicker) => void;
  onCancel?: () => void;
  onErrorStateChange: (hasError: boolean) => void;
  omitShares?: boolean;
};

export default function TickerQuantityFieldsItem({
  initialBucketTicker,
  onUpdate,
  onDelete,
  onCancel,
  onErrorStateChange,
  existingBucketTickers = [],
  omitShares = false,
}: TickerQuantityFieldsItemProps) {
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

  const handleDelete = useCallback(() => {
    const onDelete = onDeleteStableRef.current;
    const onCancel = onCancelStableRef.current;

    if (bucketTicker && typeof onDelete === "function") {
      onDelete(bucketTicker);
    } else if (typeof onCancel === "function") {
      onCancel();
    }
  }, [bucketTicker, onDeleteStableRef, onCancelStableRef]);

  const isDeleteButtonDisabled = !bucketTicker && !existingBucketTickers.length;

  return (
    <>
      <Grid2 container spacing={2} mb={1}>
        {/* Avatar Section */}
        <Grid2
          size={{
            xs: 12,
            sm: 1,
          }}
        >
          <AvatarLogo tickerDetail={tickerDetail} />
        </Grid2>

        {/* Symbol Input */}
        <Grid2
          size={{
            xs: 12,
            sm: 3,
          }}
        >
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

        {/* Shares Input */}
        {!omitShares && (
          <Grid2
            size={{
              xs: 12,
              sm: 5,
            }}
          >
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

      {/* Search Modal */}
      <TickerSearchModal
        open={isSearchModalOpen}
        onSelectTicker={handleSelectTicker}
        onCancel={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
