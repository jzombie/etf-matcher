import React, { useMemo, useState } from "react";

import { Alert, Box, Link, Typography } from "@mui/material";

import Layout, { Aside, Content, Footer } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import type { RustServiceTickerSearchResult } from "@services/RustService";

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
  tickerBucketType,
  adjustedTickerDetails,
  isTiling,
  ...rest
}: MultiTickerManagerAppletProps) {
  const {
    selectTickerSymbol,
    deselectTickerSymbol,
    selectedTickerSymbols,
    selectAllTickerSymbols,
    clearSelectedTickerSymbols,
    areAllTickersSelected,
    areNoTickersSelected,
    adjustTicker,
    addSearchResultTickers,
    removeTickerWithSymbol,
    adjustedTickerBucket,
    filteredTickerBucket,
    saveTickerBucket,
    cancelTickerAdjustments,
    isTickerBucketSaved,
    //
    missingAuditedTickerSymbols,
    //
    forceRefreshIndex,
  } = useTickerSelectionManagerContext();

  const navigateToSymbol = useTickerSymbolNavigation();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const disabledSearchTickerSymbols = useMemo(
    () => adjustedTickerDetails?.map((tickerDetail) => tickerDetail.symbol),
    [adjustedTickerDetails],
  );

  const aggregatedAuditErrorMessage = useMemo(() => {
    if (!missingAuditedTickerSymbols?.length) {
      return;
    }

    return `${missingAuditedTickerSymbols?.length} ticker${missingAuditedTickerSymbols?.length !== 1 ? "s" : ""} ${missingAuditedTickerSymbols?.length !== 1 ? "are" : "is"} missing in the ticker vectors. Please investigate.`;
  }, [missingAuditedTickerSymbols]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      tickerBucketType={tickerBucketType}
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
                onSelectAllTickerSymbols={selectAllTickerSymbols}
                areAllTickersSelected={areAllTickersSelected}
                onClearSelectedTickerSymbols={clearSelectedTickerSymbols}
                areNoTickersSelected={areNoTickersSelected}
                onOpenSearchModal={() => setIsSearchModalOpen(true)}
                isSearchModalOpen={isSearchModalOpen}
              />
            </Padding>
          </Aside>
          <Scrollable>
            {adjustedTickerDetails?.map((tickerDetail) => {
              const isDeleted = !adjustedTickerBucket.tickers
                .map((ticker) => ticker.symbol)
                .includes(tickerDetail.symbol);

              if (isDeleted) {
                return;
              }

              const isSelected = selectedTickerSymbols.some(
                (tickerSymbol) => tickerSymbol === tickerDetail.symbol,
              );

              const isDisabled = !filteredTickerBucket.tickers.find(
                (filteredTicker) =>
                  filteredTicker.symbol === tickerDetail.symbol,
              );

              const isMissingInTickerVectors =
                missingAuditedTickerSymbols?.includes(tickerDetail.symbol) ||
                false;

              return (
                <Section key={tickerDetail.symbol} mx={1} my={1} ml={0}>
                  <MultiTickerManagerTicker
                    key={forceRefreshIndex}
                    adjustedTickerBucket={adjustedTickerBucket}
                    tickerDetail={tickerDetail}
                    isMissingInTickerVectors={isMissingInTickerVectors}
                    isTiling={isTiling}
                    onSelect={() => selectTickerSymbol(tickerDetail.symbol)}
                    onDeselect={() => deselectTickerSymbol(tickerDetail.symbol)}
                    onAdjust={(adjustedTicker) => {
                      // Note: I experimented with throttling, but the UI update
                      // performance tradeoff wasn't worth it at the time
                      debounceWithKey(
                        `$multi-ticker-select-${adjustedTicker.symbol}}`,
                        () => {
                          adjustTicker(adjustedTicker);
                        },
                        TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME,
                      );
                    }}
                    onDelete={() => {
                      removeTickerWithSymbol(tickerDetail.symbol);

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
            {adjustedTickerDetails?.length === 1 && (
              <Alert severity="info" sx={{ marginTop: 2 }}>
                <Link
                  onClick={() => setIsSearchModalOpen(true)}
                  sx={{ cursor: "pointer" }}
                >
                  Add more tickers
                </Link>{" "}
                to make better use of this {tickerBucketType}.
              </Alert>
            )}
          </Scrollable>
        </Content>
        <Footer>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{
                display: "inline-block",
              }}
              mr={2}
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

            <TickerSymbolsCopyButton
              tickerSymbols={filteredTickerBucket.tickers.map(
                (ticker) => ticker.symbol,
              )}
            />
          </Box>
        </Footer>
      </Layout>

      {/* Ticker Search Modal */}
      <TickerSearchModal
        open={isSearchModalOpen}
        // TODO: Memoize
        onSelect={(searchQueryResults) =>
          addSearchResultTickers(
            searchQueryResults
              .map((searchQueryResult) => searchQueryResult.tickerSearchResult)
              .filter(
                (
                  tickerSearchResult,
                ): tickerSearchResult is RustServiceTickerSearchResult =>
                  !!tickerSearchResult,
              ),
          )
        }
        onClose={() => setIsSearchModalOpen(false)}
        disabledTickerSymbols={disabledSearchTickerSymbols}
      />
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
