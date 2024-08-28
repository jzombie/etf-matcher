import React, { useCallback, useState } from "react";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Grid, IconButton, TextField } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";
import { RustServiceTickerSearchResult } from "@src/types";

import AvatarLogo from "@components/AvatarLogo";
import TickerSearchModal from "@components/TickerSearchModal";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useTickerDetail from "@hooks/useTickerDetail";

import customLogger from "@utils/customLogger";
import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";
import removeCommas from "@utils/string/removeCommas";

export type TickerQuantityFieldsItemProps = {
  initialBucketTicker?: TickerBucketTicker;
  existingBucketTickers: TickerBucketTicker[];
  onUpdate: (bucketTicker: TickerBucketTicker | null) => void;
  onDelete?: (bucketTicker: TickerBucketTicker) => void;
  omitShares?: boolean;
};

export default function TickerQuantityFieldsItem({
  initialBucketTicker,
  onUpdate,
  onDelete,
  existingBucketTickers = [],
  omitShares = false,
  // TODO: Route error state up
}: TickerQuantityFieldsItemProps) {
  const onUpdateStableRef = useStableCurrentRef(onUpdate);
  const onDeleteStableRef = useStableCurrentRef(onDelete);

  const [bucketTicker, _setBucketTicker] = useState<
    TickerBucketTicker | undefined | null
  >(initialBucketTicker);

  const [inputValue, setInputValue] = useState<string>(
    bucketTicker?.quantity
      ? formatNumberWithCommas(bucketTicker.quantity.toString())
      : "",
  );

  const { tickerDetail } = useTickerDetail(bucketTicker?.tickerId);
  const [tickerError, setTickerError] = useState<string | null>(null);

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
      const value = event.target.value;

      // Remove commas to handle the raw number input
      const rawValue = removeCommas(value);

      // Ensure the input is a valid number
      if (!/^\d*\.?\d*$/.test(rawValue)) {
        setTickerError("Invalid number format");
        return;
      }

      const numericValue = parseFloat(rawValue);

      // Enforce the value to be greater than 0
      if (numericValue <= 0) {
        setTickerError("The quantity must be greater than 0");

        // TODO: Fix issues where setting and editing fractional shares is difficult!
        // setInputValue("");
        return;
      }

      setTickerError(null);

      // Format with commas
      const formattedValue = formatNumberWithCommas(rawValue);
      setInputValue(formattedValue);

      if (bucketTicker) {
        handleSetBucketTicker({
          ...bucketTicker,
          quantity: numericValue,
        });
      } else {
        customLogger.error(
          "Cannot add quantity to non-existing `bucketTicker`",
        );
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

    if (bucketTicker && typeof onDelete === "function") {
      onDelete(bucketTicker);
    }
  }, [bucketTicker, onDeleteStableRef]);

  return (
    <>
      <Grid container spacing={2} mb={1}>
        <Grid item xs={2} sm={1}>
          {tickerDetail && <AvatarLogo tickerDetail={tickerDetail} />}
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            name="symbol_or_company_name"
            label="Symbol"
            variant="outlined"
            fullWidth
            required
            value={bucketTicker?.symbol}
            disabled={Boolean(bucketTicker)}
            onChange={() => setIsSearchModalOpen(true)}
            onClick={() => setIsSearchModalOpen(true)}
            error={Boolean(tickerError)}
            helperText={tickerError}
            size="small"
          />
        </Grid>
        {!omitShares && (
          <Grid item xs={12} sm={4}>
            <TextField
              name="shares"
              label="Shares"
              variant="outlined"
              fullWidth
              required
              type="text" // `text` is used so the number can be numerically formatted
              value={inputValue}
              onChange={handleQuantityInputChange}
              disabled={!bucketTicker}
              size="small"
            />
          </Grid>
        )}

        {bucketTicker && (
          <Grid
            item
            xs={12}
            sm={2}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: {
                xs: "flex-end", // Align the button to the right on mobile
                sm: "flex-start", // Align as before on larger screens
              },
            }}
          >
            <IconButton disabled={!bucketTicker} onClick={handleDelete}>
              <RemoveCircleOutlineIcon
                color={!bucketTicker ? "disabled" : "error"}
              />
            </IconButton>
          </Grid>
        )}
      </Grid>

      {
        // TODO: Add existing tickers to disable (so they cannot be re-selected)
      }
      <TickerSearchModal
        open={isSearchModalOpen}
        onSelectTicker={handleSelectTicker}
        onCancel={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
