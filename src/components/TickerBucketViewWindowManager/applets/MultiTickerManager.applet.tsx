import React from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

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
  const { selectTickerId, deselectTickerId, selectedTickerIds } =
    useTickerSelectionManagerContext();

  // const handleSymbolActivationChange = useCallback(() => {}, []);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <Box>
        {multiTickerDetails?.map((tickerDetail) => (
          <FormControlLabel
            key={tickerDetail.ticker_id}
            control={
              <Checkbox
                checked={selectedTickerIds.includes(tickerDetail.ticker_id)}
                onChange={(evt) =>
                  evt.target.checked
                    ? selectTickerId(tickerDetail.ticker_id)
                    : deselectTickerId(tickerDetail.ticker_id)
                }
              />
            }
            label={tickerDetail.symbol}
          />
        ))}
      </Box>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
