import React from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import { Box, IconButton, Typography } from "@mui/material";

import Layout, { Aside, Content, Footer } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import Section from "@components/Section";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../../hooks/useTickerSelectionManagerContext";
import MultiTickerManagerTicker from "./MultiTickerManager.Ticker";

export type MultiTickerManagerAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

// Number of milliseconds to wait before applying calculation updates
const TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME = 250;

export default function MultiTickerManagerApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerManagerAppletProps) {
  const {
    selectTickerId,
    deselectTickerId,
    selectedTickerIds,
    adjustTicker,
    adjustedTickerBucket,
    filteredTickerBucket,
    saveTickerBucket,
    isTickerBucketSaved,
  } = useTickerSelectionManagerContext();

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
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
                >
                  <SaveIcon fontSize="large" />
                </IconButton>

                {/* Select All Icon */}
                <IconButton
                  onClick={() => {
                    // TODO: Implement
                    customLogger.log("Select all action triggered");
                  }}
                  // disabled={isDisabled}
                >
                  <CheckBoxIcon fontSize="large" />
                </IconButton>

                {/* Unselect All Icon */}
                <IconButton
                  onClick={() => {
                    // TODO: Implement
                    customLogger.log("Unselect all action triggered");
                  }}
                  // disabled={isDisabled}
                >
                  <CheckBoxOutlineBlankIcon fontSize="large" />
                </IconButton>

                {/* Add Child Bucket Icon */}
                <IconButton
                  onClick={() => {
                    // TODO: Implement
                    customLogger.log("Add child item action triggered");
                  }}
                  // disabled={isDisabled}
                >
                  <AddCircleOutlineIcon fontSize="large" />
                </IconButton>
              </Box>
            </Padding>
          </Aside>
          <Scrollable>
            {multiTickerDetails?.map((tickerDetail) => {
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
                    adjustedTickerBucket={adjustedTickerBucket}
                    tickerDetail={tickerDetail}
                    onSelect={() => selectTickerId(tickerDetail.ticker_id)}
                    onDeselect={() => deselectTickerId(tickerDetail.ticker_id)}
                    onAdjust={(adjustedTicker) => {
                      debounceWithKey(
                        `$multi-ticker-select-${adjustedTicker.tickerId}}`,
                        () => {
                          adjustTicker(adjustedTicker);
                        },
                        TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME,
                      );
                    }}
                    onDelete={() => alert("TODO: Implement `onDelete`")}
                    onNavigate={() => navigateToSymbol(tickerDetail.symbol)}
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
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
