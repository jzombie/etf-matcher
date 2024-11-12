import React from "react";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";

export type MultiTickerManagerAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerManagerApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerManagerAppletProps) {
  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <div>
        TODO: Add checkboxes to dynamically hide/show a particular ticker from
        the calculations.
      </div>
      {multiTickerDetails?.map((tickerDetail) => (
        <div key={tickerDetail.ticker_id}>{tickerDetail.symbol}</div>
      ))}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
