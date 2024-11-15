import React from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

// import TextField from "@mui/material/TextField";
import Scrollable from "@layoutKit/Scrollable";

// New import for quantity input
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

  // TODO: Add ability to copy the selected ticker symbols (search for `copySymbolsToClipboard` and refactor)

  // const handleQuantityChange = (tickerId: number, newQuantity: number) => {
  //   const ticker = multiTickerDetails?.find((t) => t.ticker_id === tickerId);
  //   if (ticker) {
  //     selectTicker({ ...ticker, quantity: newQuantity });
  //   }
  // };

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
          // const selectedTicker = selectedTickers.find(
          //   (ticker) => ticker.tickerId === tickerDetail.ticker_id,
          // );

          return (
            <Box
              key={tickerDetail.ticker_id}
              display="flex"
              alignItems="center"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={(evt) =>
                      evt.target.checked
                        ? selectTicker({
                            tickerId: tickerDetail.ticker_id,
                            exchangeShortName: tickerDetail.exchange_short_name,
                            symbol: tickerDetail.symbol,
                            // TODO: Don't hardcode quantity?
                            quantity: 1,
                          })
                        : deselectTicker(tickerDetail.ticker_id)
                    }
                  />
                }
                label={tickerDetail.symbol}
              />
              {/* {isSelected && (
                <TextField
                  type="number"
                  label="Quantity"
                  value={selectedTicker?.quantity || 1}
                  onChange={(e) =>
                    handleQuantityChange(
                      tickerDetail.tickerId,
                      Number(e.target.value),
                    )
                  }
                  inputProps={{ min: 0 }}
                  size="small"
                  style={{ width: 80, marginLeft: 8 }}
                />
              )} */}
            </Box>
          );
        })}
      </Scrollable>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
