import React, { useEffect } from "react";

import { fetchWeightedTicker10KDetail } from "@services/RustService";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerFundamentalsAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerFundamentalsApplet({
  formattedSymbolsWithExchange,
  ...rest
}: MultiTickerFundamentalsAppletProps) {
  const { selectedTickerIds } = useTickerSelectionManagerContext();

  useEffect(() => {
    fetchWeightedTicker10KDetail(
      selectedTickerIds,
      selectedTickerIds.map((_) => 1),
    ).then((agg10KDetail) => console.log({ agg10KDetail }));
  }, [selectedTickerIds]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      formattedSymbolsWithExchange={formattedSymbolsWithExchange}
      {...rest}
    >
      <div>[...]</div>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
