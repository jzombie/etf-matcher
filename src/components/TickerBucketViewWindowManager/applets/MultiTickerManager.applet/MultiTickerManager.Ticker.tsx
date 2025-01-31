import React, { useCallback, useState } from "react";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LinkIcon from "@mui/icons-material/Link";
import { Box, IconButton } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

import type { RustServiceTickerDetail } from "@services/RustService";
import { TickerBucket, TickerBucketTicker } from "@src/store";

import AvatarLogo from "@components/AvatarLogo";
import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

import TickerWeightSelector from "./MultiTickerManager.TickerWeightSelector";

export type MultiTickerManagerTickerProps = {
  adjustedTickerBucket: TickerBucket;
  tickerDetail: RustServiceTickerDetail;
  isMissingInTickerVectors: boolean;
  isTiling: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onAdjust: (adjustedTicker: TickerBucketTicker) => void;
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
  isMissingInTickerVectors,
  isTiling,
  onSelect,
  onDeselect,
  onAdjust,
  onDelete,
  onNavigate,
  minWeight,
  maxWeight,
  selected: isSelected,
  disabled: isDisabled,
}: MultiTickerManagerTickerProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const onDeleteStableRef = useStableCurrentRef(onDelete);
  const [isShowingDeleteModal, setIsShowingDeleteModal] =
    useState<boolean>(false);

  const handleDelete = useCallback(() => {
    const onDelete = onDeleteStableRef.current;

    onDelete();

    setIsShowingDeleteModal(false);
  }, [onDeleteStableRef]);

  const tickerBucketTicker = adjustedTickerBucket.tickers.find(
    (tickerBucketTicker) =>
      tickerBucketTicker.symbol === tickerDetail.ticker_symbol,
  );

  return (
    <Box
      key={tickerDetail.ticker_symbol}
      display="flex"
      flexDirection="column"
      alignItems="start"
      padding={1}
    >
      <Box display="flex" alignItems="center" width="100%">
        <Checkbox
          checked={isSelected}
          onChange={(evt) => {
            evt.target.checked ? onSelect() : onDeselect();
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
                {tickerDetail.ticker_symbol}
                {isMissingInTickerVectors && (
                  <Box
                    component="span"
                    sx={{
                      marginLeft: 1,
                      color: "warning.main",
                      cursor: "help",
                    }}
                    title="This ticker is missing in the ticker vectors. Adjust or investigate."
                  >
                    ⚠️
                  </Box>
                )}
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
          onClick={() => setIsShowingDeleteModal(true)}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          paddingTop: 1,
          width: "100%",
        }}
      >
        <Box style={{ width: "100%" }}>
          <TickerWeightSelector
            mx={8}
            isTiling={isTiling}
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

              onAdjust({
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

      <DeleteEntityDialogModal
        open={isShowingDeleteModal}
        onClose={() => setIsShowingDeleteModal(false)}
        onCancel={() => setIsShowingDeleteModal(false)}
        onDelete={handleDelete}
        title={`Confirm Delete`}
        content={`Are you sure you want to remove "${tickerDetail.ticker_symbol}" from "${adjustedTickerBucket.name}"?`}
      />
    </Box>
  );
}
