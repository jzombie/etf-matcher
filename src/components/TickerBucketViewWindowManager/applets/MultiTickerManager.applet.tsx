import React, { useCallback, useEffect, useRef } from "react";

import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";

import Scrollable from "@layoutKit/Scrollable";

import AvatarLogo from "@components/AvatarLogo";
import LogarithmicSlider from "@components/LogarithmicSlider";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";
import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

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
      <Scrollable>
        {multiTickerDetails?.map((tickerDetail) => {
          const tickerBucketTicker = adjustedTickerBucket.tickers.find(
            (tickerBucketTicker) =>
              tickerBucketTicker.tickerId === tickerDetail.ticker_id,
          );

          // TODO: Handle this condition
          if (!tickerBucketTicker) {
            return "N/A";
          }

          const isSelected = selectedTickers.some(
            (ticker) => ticker.tickerId === tickerBucketTicker.tickerId,
          );

          return (
            <Box
              key={tickerBucketTicker.tickerId}
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
                      ? selectTicker({
                          tickerId: tickerBucketTicker.tickerId,
                          exchangeShortName:
                            tickerBucketTicker.exchangeShortName,
                          symbol: tickerBucketTicker.symbol,
                          quantity: 1,
                        })
                      : deselectTicker(tickerBucketTicker.tickerId);
                  }}
                />

                <AvatarLogo
                  tickerDetail={tickerDetail}
                  style={{ marginRight: 8 }}
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
                        {tickerBucketTicker.symbol}
                      </Box>
                      <Box fontSize="small" color="text.secondary">
                        {tickerBucketTicker.exchangeShortName}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title="View Details"
                      onClick={() => {
                        navigateToSymbol(tickerBucketTicker.symbol);
                      }}
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
                  <QuantitySlider
                    onChange={(evt, val) => {
                      // TODO: Throttling might be better suited for this so that it can make adjustments while sliding
                      debounceWithKey(
                        `$multi-ticker-select-${tickerBucketTicker.tickerId}}`,
                        () => {
                          selectTicker({
                            ...tickerBucketTicker,
                            quantity: val,
                          });
                        },
                        TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME,
                      );

                      // TODO: Remove
                      customLogger.debug({ val });
                    }}
                    defaultValue={tickerBucketTicker.quantity}
                    // TODO: Adjust threshold automatically and arbitrarily
                    min={0.001}
                    max={10000000} // Adjust range as necessary
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Scrollable>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}

type QuantitySliderProps = {
  min: number;
  max: number;
  defaultValue?: number;
  value?: number;
  onChange: (evt: Event, value: number) => void;
};

function QuantitySlider({
  min,
  max,
  onChange,
  defaultValue,
  value,
}: QuantitySliderProps) {
  const onChangeStableRef = useStableCurrentRef(onChange);

  // Prevent MUI warnings regarding changing the default value
  const defaultValueRef = useRef(defaultValue);

  const handleSliderChange = useCallback(
    (evt: Event, value: number) => {
      const onChange = onChangeStableRef.current;

      onChange(evt, value);
    },
    [onChangeStableRef],
  );

  return (
    <Box>
      <Box>
        <LogarithmicSlider
          // aria-label="Quantity Slider"
          valueLabelDisplay="auto"
          min={min}
          max={max}
          step={1}
          sx={{
            color: "primary.main",
            marginLeft: 2,
            width: "80%",
          }}
          formatValueLabel={(logValue) => formatNumberWithCommas(logValue)}
          defaultValue={defaultValueRef.current}
          value={value}
          onChange={handleSliderChange}
        />
      </Box>
      <Box>
        <input type="number" />
      </Box>
    </Box>
  );
}
