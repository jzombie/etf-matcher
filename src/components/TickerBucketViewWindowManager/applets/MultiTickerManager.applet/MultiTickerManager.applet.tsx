import React, { useMemo, useState } from "react";

import { Box, Typography } from "@mui/material";

import Layout, { Aside, Content, Footer } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import Padding from "@components/Padding";
import Section from "@components/Section";
import TickerSearchModal from "@components/TickerSearchModal";
import TickerSymbolsCopyButton from "@components/TickerSymbolsCopyButton";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import debounceWithKey from "@utils/debounceWithKey";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../../hooks/useTickerSelectionManagerContext";
import MultiTickerManagerAsideNav from "./MultiTickerManager.AsideNav";
import MultiTickerManagerTicker from "./MultiTickerManager.Ticker";

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
    missingAuditedTickerVectorIds,
    //
    forceRefreshIndex,
  } = useTickerSelectionManagerContext();

  const navigateToSymbol = useTickerSymbolNavigation();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const disabledSearchTickerIds = useMemo(
    () => adjustedTickerDetails?.map((tickerDetail) => tickerDetail.ticker_id),
    [adjustedTickerDetails],
  );

  const aggregatedAuditErrorMessage = useMemo(() => {
    if (!missingAuditedTickerVectorIds?.length) {
      return;
    }

    return `${missingAuditedTickerVectorIds?.length} ticker${missingAuditedTickerVectorIds?.length !== 1 ? "s" : ""} ${missingAuditedTickerVectorIds?.length !== 1 ? "are" : "is"} missing in the ticker vectors. Please investigate.`;
  }, [missingAuditedTickerVectorIds]);

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
              <MultiTickerManagerAsideNav
                onSaveTickerBucket={saveTickerBucket}
                isTickerBucketSaved={isTickerBucketSaved}
                onCancelTickerAdjustments={cancelTickerAdjustments}
                onSelectAllTickerIds={selectAllTickerIds}
                areAllTickersSelected={areAllTickersSelected}
                onClearSelectedTickerIds={clearSelectedTickerIds}
                areNoTickersSelected={areNoTickersSelected}
                onOpenSearchModal={() => setIsSearchModalOpen(true)}
                isSearchModalOpen={isSearchModalOpen}
              />
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

              const isMissingInTickerVectors =
                missingAuditedTickerVectorIds?.includes(
                  tickerDetail.ticker_id,
                ) || false;

              return (
                <Section key={tickerDetail.ticker_id} mx={1} my={1} ml={0}>
                  <MultiTickerManagerTicker
                    key={forceRefreshIndex}
                    adjustedTickerBucket={adjustedTickerBucket}
                    tickerDetail={tickerDetail}
                    isMissingInTickerVectors={isMissingInTickerVectors}
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
          <Aside>
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {filteredTickerBucket.tickers.length} item
              {filteredTickerBucket.tickers.length !== 1 ? "s" : ""} selected
              {aggregatedAuditErrorMessage && (
                <Box
                  component="span"
                  sx={{
                    marginLeft: 1,
                    display: "flex",
                    alignItems: "center",
                    color: "warning.main",
                    fontSize: "inherit",
                    cursor: "help",
                  }}
                  title={aggregatedAuditErrorMessage}
                >
                  ⚠️
                </Box>
              )}
            </Typography>
          </Aside>
          <Content>
            {
              // Intentionally empty
              " "
            }
          </Content>
          <Aside>
            <TickerSymbolsCopyButton
              tickerSymbols={filteredTickerBucket.tickers.map(
                (ticker) => ticker.symbol,
              )}
            />
          </Aside>
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
