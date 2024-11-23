import React, { useEffect } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import { Box, Typography } from "@mui/material";

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
    selectTicker,
    deselectTicker,
    selectedTickers,
    adjustedTickerBucket,
  } = useTickerSelectionManagerContext();

  // TODO: Remove
  useEffect(() => {
    customLogger.debug({ multiTickerDetails, adjustedTickerBucket });
  }, [multiTickerDetails, adjustedTickerBucket]);

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <Layout>
        <Content>
          <Aside>
            <Padding>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                {/* Save / Commit Icon */}
                <SaveIcon
                  fontSize="large"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // TODO: Add save/commit functionality here
                    customLogger.log("Commit/Save action triggered");
                  }}
                />
                {
                  // TODO: Dynamically switch between `CheckBoxIcon` depending if `all`, `none`, or `some` are selected
                }
                {/* Select / Unselect All Icon */}
                <CheckBoxIcon
                  fontSize="large"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // TODO: Add select-all functionality here
                    customLogger.log("Select all action triggered");
                  }}
                />
                <CheckBoxOutlineBlankIcon
                  fontSize="large"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // TODO: Add unselect-all functionality here
                    customLogger.log("Unselect all action triggered");
                  }}
                />
                {/* Add Child Bucket Icon */}
                <AddCircleOutlineIcon
                  fontSize="large"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // TODO: Add add-ticker/add-child-bucket functionality here
                    customLogger.log("Add child item action triggered");
                  }}
                />
              </Box>
            </Padding>
          </Aside>
          <Scrollable>
            {multiTickerDetails?.map((tickerDetail) => {
              const tickerBucketTicker = adjustedTickerBucket.tickers.find(
                (tickerBucketTicker) =>
                  tickerBucketTicker.tickerId === tickerDetail.ticker_id,
              );

              const isSelected = selectedTickers.some(
                (ticker) => ticker.tickerId === tickerDetail.ticker_id,
              );

              const isDisabled = !tickerBucketTicker;

              return (
                <Section key={tickerDetail.ticker_id} mx={1} my={1} ml={0}>
                  <MultiTickerManagerTicker
                    adjustedTickerBucket={adjustedTickerBucket}
                    tickerDetail={tickerDetail}
                    // TODO: Memoize
                    onSelectOrModify={(adjustedTicker) => {
                      // Note: I experimented with throttling here and the performance
                      // tradeoff didn't seem worth it
                      debounceWithKey(
                        `$multi-ticker-select-${adjustedTicker.tickerId}}`,
                        () => {
                          selectTicker(adjustedTicker);
                        },
                        TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME,
                      );
                    }}
                    // TODO: Memoize
                    onDeselect={() => deselectTicker(tickerDetail.ticker_id)}
                    onDelete={() => alert("TODO: Implement `onDelete`")}
                    onNavigate={() => navigateToSymbol(tickerDetail.symbol)}
                    // TODO: Don't hardcode
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
