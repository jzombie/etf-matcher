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
  onUpdate: (bucketTicker: TickerBucketTicker | null) => void;
};

export default function PortfolioFormFieldsItem({
  initialBucketTicker,
  onUpdate,
}: PortfolioFormFieldsItemProps) {
  const onUpdateStableRef = useStableCurrentRef(onUpdate);

  const [bucketTicker, _setBucketTicker] = useState<
    TickerBucketTicker | undefined | null
  >(initialBucketTicker);

  const { tickerDetail } = useTickerDetail(bucketTicker?.tickerId);

  const handleSetBucketTicker = useCallback(
    (bucketTicker: TickerBucketTicker | null) => {
      _setBucketTicker(bucketTicker);

      const onUpdate = onUpdateStableRef.current;
      onUpdate(bucketTicker);
    },
    [onUpdateStableRef],
  );

  // const handleSymbolInputChange = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //     const { value } = event.target;

  //     // Only clear out the data
  //     _setBucketTicker(null);

  //     setSearchQuery(value);
  //     setHighlightedIndex(null); // Reset highlighted index when query changes
  //   },
  //   [setSearchQuery],
  // );

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

  // TODO: Refactor as necessary
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

  return (
    <>
      <Grid container spacing={2}>
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
        <Grid
          item
          xs={12}
          sm={2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <IconButton disabled>
            <RemoveCircleOutlineIcon color={"disabled"} />
          </IconButton>
        </Grid>
      </Grid>

      <TickerSearchModal
        open={isSearchModalOpen}
        onSelectTicker={handleSelectTicker}
        onCancel={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
