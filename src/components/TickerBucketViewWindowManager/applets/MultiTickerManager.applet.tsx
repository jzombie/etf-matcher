import React from "react";

import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";

import Scrollable from "@layoutKit/Scrollable";

import AvatarLogo from "@components/AvatarLogo";
// import LogarithmicSliderInputCombo from "@components/LogarithmicSliderInputCombo";
import LogarithmicSlider from "@components/LogarithmicSlider";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

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

  // TODO: Extract to a component
  const renderQuantitySlider = (tickerId: number) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          paddingTop: 1,
          paddingLeft: 4,
          width: "100%",
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click handler
        }}
      >
        <LogarithmicSlider
          // aria-label="Quantity Slider"
          defaultValue={1}
          // valueLabelDisplay="auto"
          min={0.001}
          max={10000000} // Adjust range as necessary
          step={1}
          sx={{
            color: "primary.main",
            marginLeft: 2,
            width: "80%",
          }}
          onChange={(evt, val) => {
            evt.stopPropagation();

            console.log(val);
          }}
        />
      </Box>
    );
  };

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
              sx={{
                cursor: "pointer",
              }}
              onClick={() =>
                isSelected
                  ? deselectTicker(tickerDetail.ticker_id)
                  : selectTicker({
                      tickerId: tickerDetail.ticker_id,
                      exchangeShortName: tickerDetail.exchange_short_name,
                      symbol: tickerDetail.symbol,
                      quantity: 1,
                    })
              }
            >
              <Box display="flex" alignItems="center" width="100%">
                <Checkbox
                  checked={isSelected}
                  onChange={(evt) => {
                    evt.stopPropagation(); // Prevent the parent click handler from firing
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
                  onClick={(e) => e.stopPropagation()} // Prevent double triggering
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent click handler
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
              {renderQuantitySlider(tickerDetail.ticker_id)}
            </Box>
          );
        })}
      </Scrollable>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
