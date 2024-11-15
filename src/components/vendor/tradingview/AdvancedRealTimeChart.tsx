import React from "react";

import {
  TRADING_VIEW_COPYRIGHT_STYLES,
  TRADING_VIEW_THEME,
} from "@src/constants";
import {
  AdvancedRealTimeChart as LibAdvancedRealTimeChart,
  AdvancedRealTimeChartProps as LibAdvancedRealTimeChartProps,
} from "react-ts-tradingview-widgets";

export type AdvancedRealTimeChartProps = LibAdvancedRealTimeChartProps;

// https://tradingview-widgets.jorrinkievit.xyz/docs/components/AdvancedRealTimeChartWidget/
export default function AdvancedRealTimeChart({
  symbol,
  allow_symbol_change = false,
  theme = TRADING_VIEW_THEME,
  autosize = true,
  hotlist = true,
  copyrightStyles = TRADING_VIEW_COPYRIGHT_STYLES,
  ...rest
}: AdvancedRealTimeChartProps) {
  return (
    <LibAdvancedRealTimeChart
      symbol={symbol}
      allow_symbol_change={allow_symbol_change}
      theme={theme}
      autosize={autosize}
      hotlist={hotlist}
      copyrightStyles={copyrightStyles}
      {...rest}
    />
  );
}
