import React, { useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import { Box, IconButton } from "@mui/material";

import TickerSymbolExtractorSelectorDialogModal from "@components/TickerSymbolExtractorSelectorDialogModal";

const ICON_FONT_SIZE: "inherit" | "small" | "medium" | "large" = "medium";

export type MultiTickerManagerAsideNavProps = {
  onSaveTickerBucket: () => void;
  isTickerBucketSaved: boolean;
  onCancelTickerAdjustments: () => void;
  onSelectAllTickerIds: () => void;
  areAllTickersSelected: boolean;
  onClearSelectedTickerIds: () => void;
  areNoTickersSelected: boolean;
  onOpenSearchModal: () => void;
  isSearchModalOpen: boolean;
};

export default function MultiTickerManagerAsideNav({
  onSaveTickerBucket,
  isTickerBucketSaved,
  onCancelTickerAdjustments,
  onSelectAllTickerIds,
  areAllTickersSelected,
  onClearSelectedTickerIds,
  areNoTickersSelected,
  onOpenSearchModal,
  isSearchModalOpen,
}: MultiTickerManagerAsideNavProps) {
  // TODO: Remove
  const [isShowingTempModal, setIsShowingTempModal] = useState(false);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      {/* Save / Commit Icon */}
      <IconButton
        onClick={onSaveTickerBucket}
        disabled={isTickerBucketSaved}
        title="Save"
        aria-label="Save ticker adjustments"
      >
        <SaveIcon fontSize={ICON_FONT_SIZE} />
      </IconButton>

      {/* Cancel Adjustments Icon */}
      <IconButton
        onClick={onCancelTickerAdjustments}
        disabled={isTickerBucketSaved} // Disable when adjustments are already saved
        title="Cancel Adjustments"
        aria-label="Cancel ticker adjustments"
      >
        <CancelOutlinedIcon
          fontSize={ICON_FONT_SIZE}
          color={!isTickerBucketSaved ? "error" : "inherit"}
        />
      </IconButton>

      {/* Select All Icon */}
      <IconButton
        onClick={onSelectAllTickerIds}
        disabled={areAllTickersSelected}
        title="Select All"
        aria-label="Select all tickers"
      >
        <CheckBoxOutlineBlankIcon fontSize={ICON_FONT_SIZE} />
      </IconButton>

      {/* Unselect All Icon */}
      <IconButton
        onClick={onClearSelectedTickerIds}
        disabled={areNoTickersSelected}
        title="Unselect All"
        aria-label="Unselect all tickers"
      >
        <CheckBoxIcon fontSize={ICON_FONT_SIZE} />
      </IconButton>

      {/* Add Child Bucket Icon */}
      <IconButton
        onClick={onOpenSearchModal}
        disabled={isSearchModalOpen}
        title="Add New Ticker or Group"
        aria-label="Add new ticker or group"
      >
        <AddCircleOutlineIcon fontSize={ICON_FONT_SIZE} />
      </IconButton>

      {
        // TODO: Remove; combine w/ previous button
      }
      <IconButton
        onClick={() => {
          setIsShowingTempModal(true);
        }}
        disabled={isShowingTempModal}
        title="Temporary Action"
        aria-label="Temporary action"
      >
        <AddCircleOutlineIcon fontSize={ICON_FONT_SIZE} color="secondary" />
      </IconButton>

      {
        // TODO: Remove
      }
      <TickerSymbolExtractorSelectorDialogModal
        open={isShowingTempModal}
        onClose={() => setIsShowingTempModal(false)}
      />
    </Box>
  );
}
