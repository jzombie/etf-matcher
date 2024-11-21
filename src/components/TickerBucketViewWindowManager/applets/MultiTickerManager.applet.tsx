import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

          const isDisabled = !tickerBucketTicker;

          const isSelected = selectedTickers.some(
            (ticker) => ticker.tickerId === tickerDetail.ticker_id,
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
                      ? selectTicker({
                          tickerId: tickerDetail.ticker_id,
                          exchangeShortName: tickerDetail.exchange_short_name,
                          symbol: tickerDetail.symbol,
                          quantity: 1,
                        })
                      : deselectTicker(tickerDetail.ticker_id);
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
                      onClick={() => {
                        navigateToSymbol(tickerDetail.symbol);
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
                    tickerSymbol={tickerBucketTicker?.symbol}
                    disabled={isDisabled}
                    onChange={(evt, val) => {
                      if (!tickerBucketTicker) {
                        customLogger.warn(
                          "`tickerBucketTicker` is not available and cannot be adjusted",
                        );
                        return;
                      }

                      // Note: I experimented with throttling here and the performance
                      // tradeoff didn't seem worth it
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
                    defaultValue={tickerBucketTicker?.quantity}
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
  tickerSymbol?: string;
  min: number;
  max: number;
  defaultValue?: number;
  value?: number;
  onChange: (evt: Event, value: number) => void;
  disabled?: boolean;
};

function QuantitySlider({
  tickerSymbol,
  min,
  max,
  onChange,
  defaultValue,
  value,
  disabled,
}: QuantitySliderProps) {
  const onChangeStableRef = useStableCurrentRef(onChange);

  const [renderedValue, setRenderedValue] = useState<number>(
    defaultValue || value || 0,
  );

  // Prevent MUI warnings regarding changing the default value
  const defaultValueRef = useRef(defaultValue);

  const handleChange = useCallback(
    (evt: Event | ChangeEvent<HTMLInputElement>, value: number) => {
      if (!value || value < 0) {
        value = 0;
      }

      const onChange = onChangeStableRef.current;

      setRenderedValue(value);

      onChange(evt as Event, value);
    },
    [onChangeStableRef],
  );

  return (
    <Box>
      <Box>
        <LogarithmicSlider
          aria-label={`${tickerSymbol || "Ticker"} Quantity Slider`}
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
          value={renderedValue}
          onChange={handleChange}
          disabled={disabled}
        />
      </Box>
      <Box>
        <input
          type="number"
          value={renderedValue}
          onChange={(evt) => handleChange(evt, parseFloat(evt.target.value))}
        />
      </Box>
    </Box>
  );
}
