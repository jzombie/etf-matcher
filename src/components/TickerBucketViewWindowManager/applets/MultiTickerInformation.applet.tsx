import React from "react";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";

export type MultiTickerInformationAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerInformationApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerInformationAppletProps) {
  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <div>
        TODO: Render combined ticker information. Possibly incliude checkboxes
        to dynamically hide/show a particular ticker from the calculations.
      </div>
      {multiTickerDetails?.map((tickerDetail) => (
        <div key={tickerDetail.ticker_id}>{tickerDetail.symbol}</div>
      ))}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
