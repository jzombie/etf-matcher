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

export type PortfolioFormFieldsItemProps = {
  initialBucketTicker?: TickerBucketTicker;
  existingBucketTickers: TickerBucketTicker[];
  onUpdate: (bucketTicker: TickerBucketTicker | null) => void;
  onDelete?: (bucketTicker: TickerBucketTicker) => void;
};

// TODO: Prompt for confirmation before deleting
export default function PortfolioFormFieldsItem({
  initialBucketTicker,
  onUpdate,
  onDelete,
  existingBucketTickers = [],
}: PortfolioFormFieldsItemProps) {
  const onUpdateStableRef = useStableCurrentRef(onUpdate);
  const onDeleteStableRef = useStableCurrentRef(onDelete);

  const [bucketTicker, _setBucketTicker] = useState<
    TickerBucketTicker | undefined | null
  >(initialBucketTicker);

  const { tickerDetail } = useTickerDetail(bucketTicker?.tickerId);
  const [tickerError, setTickerError] = useState<string | null>(null);

  const handleSetBucketTicker = useCallback(
    (bucketTicker: TickerBucketTicker | null) => {
      if (
        bucketTicker &&
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
    [existingBucketTickers, onUpdateStableRef],
  );

  const handleQuantityInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      if (bucketTicker) {
        handleSetBucketTicker({
          ...bucketTicker,
          // Coerce to positive values
          quantity: Math.abs(parseFloat(value)),
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
        <Grid item xs={12} sm={4}>
          <TextField
            name="shares"
            label="Shares"
            variant="outlined"
            fullWidth
            required
            type="number"
            value={bucketTicker?.quantity || ""}
            onChange={handleQuantityInputChange}
            disabled={!bucketTicker}
            size="small"
          />
        </Grid>
        {bucketTicker && (
          <Grid
            item
            xs={12}
            sm={2}
            sx={{ display: "flex", alignItems: "center" }}
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
