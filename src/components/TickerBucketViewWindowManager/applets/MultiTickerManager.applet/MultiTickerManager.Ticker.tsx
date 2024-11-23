import React from "react";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LinkIcon from "@mui/icons-material/Link";
import { Box, IconButton } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

import type { RustServiceTickerDetail } from "@services/RustService";
import { TickerBucket, TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import TickerWeightSelector from "./MultiTickerManager.TickerWeightSelector";

export type MultiTickerManagerTickerProps = {
  adjustedTickerBucket: TickerBucket;
  tickerDetail: RustServiceTickerDetail;
  onSelectOrModify: (adjustedTicker: TickerBucketTicker) => void;
  onDeselect: () => void;
  onDelete: () => void;
  onNavigate: () => void;
  minWeight: number;
  maxWeight: number;
  selected: boolean;
  disabled: boolean;
};

export default function MultiTickerManagerTicker({
  adjustedTickerBucket,
  tickerDetail,
  onSelectOrModify,
  onDeselect,
  onDelete,
  onNavigate,
  minWeight,
  maxWeight,
  selected: isSelected,
  disabled: isDisabled,
}: MultiTickerManagerTickerProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const tickerBucketTicker = adjustedTickerBucket.tickers.find(
    (tickerBucketTicker) =>
      tickerBucketTicker.tickerId === tickerDetail.ticker_id,
  );

  return (
    <Box
      key={tickerDetail.ticker_id}
      display="flex"
      flexDirection="column" // Updated to stack slider vertically
      alignItems="start"
      padding={1}
    >
      <Box display="flex" alignItems="center" width="100%">
        <Checkbox
          checked={isSelected}
          onChange={(evt) => {
            evt.target.checked
              ? onSelectOrModify({
                  tickerId: tickerDetail.ticker_id,
                  exchangeShortName: tickerDetail.exchange_short_name,
                  symbol: tickerDetail.symbol,
                  quantity: 1,
                })
              : onDeselect();
          }}
        />

        <AvatarLogo
          tickerDetail={tickerDetail}
          style={{ marginRight: 8 }}
          disabled={isDisabled}
        />

        <Box>
          <Box display="flex" alignItems="center">
            <Box display="flex" alignItems="center" marginRight={1}>
              <Box
                sx={{
                  fontWeight: "bold",
                  marginRight: 1,
                }}
              >
                {tickerDetail.symbol}
              </Box>
              <Box fontSize="small" color="text.secondary">
                {tickerDetail.exchange_short_name}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              title="View Details"
              onClick={onNavigate}
            >
              <LinkIcon
                fontSize="small"
                sx={{
                  marginLeft: 0.5,
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              fontSize: "small",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px", // Adjust based on layout needs
              display: "inline-block",
              verticalAlign: "middle",
            }}
            title={tickerDetail.company_name} // Tooltip for full name
          >
            {tickerDetail.company_name}
          </Box>
        </Box>

        {/* Placeholder Delete Icon */}
        <IconButton
          aria-label="Delete Ticker"
          sx={{ marginLeft: "auto", color: "error.main" }}
          onClick={onDelete}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          paddingTop: 1,
          paddingLeft: 4,
          width: "100%",
        }}
      >
        <Box style={{ width: "100%" }}>
          <TickerWeightSelector
            mx={8}
            tickerSymbol={tickerBucketTicker?.symbol}
            disabled={isDisabled}
            onChange={(evt, val) => {
              if (!tickerBucketTicker) {
                triggerUIError(
                  new Error(
                    "`tickerBucketTicker` is not available and cannot be adjusted",
                  ),
                );
                return;
              }

              onSelectOrModify({
                ...tickerBucketTicker,
                quantity: val,
              });
            }}
            defaultValue={tickerBucketTicker?.quantity}
            min={minWeight}
            max={maxWeight}
          />
        </Box>
      </Box>
    </Box>
  );
}
