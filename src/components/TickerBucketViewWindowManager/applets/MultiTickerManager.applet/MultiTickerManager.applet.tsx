import React, { useMemo, useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import { Box, IconButton, Typography } from "@mui/material";

import Layout, { Aside, Content, Footer } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import Section from "@components/Section";
import TickerSearchModal from "@components/TickerSearchModal";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import debounceWithKey from "@utils/debounceWithKey";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../../hooks/useTickerSelectionManagerContext";
import MultiTickerManagerTicker from "./MultiTickerManager.Ticker";

const ICON_FONT_SIZE: "inherit" | "small" | "medium" | "large" = "medium";

export type MultiTickerManagerAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

// Number of milliseconds to wait before applying calculation updates
const TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME = 250;

export default function MultiTickerManagerApplet({
  adjustedTickerDetails,
  isTiling,
  ...rest
}: MultiTickerManagerAppletProps) {
  const {
    selectTickerId,
    deselectTickerId,
    selectedTickerIds,
    selectAllTickerIds,
    clearSelectedTickerIds,
    areAllTickersSelected,
    areNoTickersSelected,
    adjustTicker,
    addSearchResultTicker,
    removeTickerWithId,
    adjustedTickerBucket,
    filteredTickerBucket,
    saveTickerBucket,
    cancelTickerAdjustments,
    isTickerBucketSaved,
    //
    forceRefreshIndex,
  } = useTickerSelectionManagerContext();

  const navigateToSymbol = useTickerSymbolNavigation();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const disabledSearchTickerIds = useMemo(
    () => adjustedTickerDetails?.map((tickerDetail) => tickerDetail.ticker_id),
    [adjustedTickerDetails],
  );

  return (
    <TickerBucketViewWindowManagerAppletWrap
      adjustedTickerDetails={adjustedTickerDetails}
      isTiling={isTiling}
      {...rest}
    >
      <Layout>
        <Content>
          <Aside>
            <Padding half>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                {/* Save / Commit Icon */}
                <IconButton
                  onClick={saveTickerBucket}
                  disabled={isTickerBucketSaved}
                  title="Save"
                  aria-label="Save ticker adjustments"
                >
                  <SaveIcon fontSize={ICON_FONT_SIZE} />
                </IconButton>

                {/* Cancel Adjustments Icon */}
                <IconButton
                  onClick={cancelTickerAdjustments}
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
                  onClick={selectAllTickerIds}
                  disabled={areAllTickersSelected}
                  title="Select All"
                  aria-label="Select all tickers"
                >
                  <CheckBoxOutlineBlankIcon fontSize={ICON_FONT_SIZE} />
                </IconButton>

                {/* Unselect All Icon */}
                <IconButton
                  onClick={clearSelectedTickerIds}
                  disabled={areNoTickersSelected}
                  title="Unselect All"
                  aria-label="Unselect all tickers"
                >
                  <CheckBoxIcon fontSize={ICON_FONT_SIZE} />
                </IconButton>

                {/* Add Child Bucket Icon */}
                <IconButton
                  onClick={() => setIsSearchModalOpen(true)}
                  disabled={isSearchModalOpen}
                  title="Add New Ticker or Group"
                  aria-label="Add new ticker or group"
                >
                  <AddCircleOutlineIcon fontSize={ICON_FONT_SIZE} />
                </IconButton>
              </Box>
            </Padding>
          </Aside>
          <Scrollable>
            {adjustedTickerDetails?.map((tickerDetail) => {
              const isDeleted = !adjustedTickerBucket.tickers
                .map((ticker) => ticker.tickerId)
                .includes(tickerDetail.ticker_id);

              if (isDeleted) {
                return;
              }

              const isSelected = selectedTickerIds.some(
                (tickerId) => tickerId === tickerDetail.ticker_id,
              );

              const isDisabled = !filteredTickerBucket.tickers.find(
                (filteredTicker) =>
                  filteredTicker.tickerId === tickerDetail.ticker_id,
              );

              return (
                <Section key={tickerDetail.ticker_id} mx={1} my={1} ml={0}>
                  <MultiTickerManagerTicker
                    key={forceRefreshIndex}
                    adjustedTickerBucket={adjustedTickerBucket}
                    tickerDetail={tickerDetail}
                    isTiling={isTiling}
                    onSelect={() => selectTickerId(tickerDetail.ticker_id)}
                    onDeselect={() => deselectTickerId(tickerDetail.ticker_id)}
                    onAdjust={(adjustedTicker) => {
                      // Note: I experimented with throttling, but the UI update
                      // performance tradeoff wasn't worth it at the time
                      debounceWithKey(
                        `$multi-ticker-select-${adjustedTicker.tickerId}}`,
                        () => {
                          adjustTicker(adjustedTicker);
                        },
                        TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME,
                      );
                    }}
                    onDelete={() => {
                      removeTickerWithId(tickerDetail.ticker_id);

                      // Auto-save
                      saveTickerBucket();
                    }}
                    onNavigate={() => navigateToSymbol(tickerDetail.symbol)}
                    // TODO: Base on dynamic ranges
                    minWeight={0.001}
                    maxWeight={10000000000}
                    selected={isSelected}
                    disabled={isDisabled}
                  />
                </Section>
              );
            })}
          </Scrollable>
        </Content>
        <Footer>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              {adjustedTickerBucket.tickers.length} item
              {adjustedTickerBucket.tickers.length !== 1 ? "s" : ""} selected
            </Typography>
          </Box>
        </Footer>
      </Layout>

      {/* Ticker Search Modal */}
      <TickerSearchModal
        open={isSearchModalOpen}
        onSelectTicker={addSearchResultTicker}
        onCancel={() => setIsSearchModalOpen(false)}
        disabledTickerIds={disabledSearchTickerIds}
      />
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
