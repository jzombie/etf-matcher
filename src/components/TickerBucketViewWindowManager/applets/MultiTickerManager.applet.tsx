import React, { useCallback } from "react";

import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";

import Scrollable from "@layoutKit/Scrollable";

import AvatarLogo from "@components/AvatarLogo";
import LogarithmicSlider from "@components/LogarithmicSlider";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerManagerAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerManagerApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerManagerAppletProps) {
  const { selectTicker, deselectTicker, selectedTickers } =
    useTickerSelectionManagerContext();

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <Scrollable>
        {multiTickerDetails?.map((tickerDetail) => {
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
                    onChange={(evt, val) => {
                      // TODO: Handle
                      customLogger.debug({ val });
                    }}
                    defaultValue={1} // TODO: Obtain from bucket weight
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
  onChange: (evt: Event, value: number) => void;
  defaultValue: number;
};

function QuantitySlider({ onChange, defaultValue }: QuantitySliderProps) {
  const onChangeStableRef = useStableCurrentRef(onChange);

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
          defaultValue={defaultValue}
          // valueLabelDisplay="auto"
          min={0.001}
          max={10000000} // Adjust range as necessary
          step={1}
          sx={{
            color: "primary.main",
            marginLeft: 2,
            width: "80%",
          }}
          onChange={handleSliderChange}
        />
      </Box>
      <Box>
        <input type="number" />
      </Box>
    </Box>
  );
}
