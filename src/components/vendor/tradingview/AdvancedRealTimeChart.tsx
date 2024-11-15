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

// https://www.tradingview.com/charting-library-docs/latest/customization/overrides/chart-overrides/#chart-styles
export enum AdvancedRealTimeChartStyle {
  BARS = "0", // Bars
  CANDLES = "1", // Candles
  HOLLOW_CANDLES = "2", // Hollow Candles
  AREA = "3", // Area
  HEIKIN_ASHI = "4", // Heikin Ashi
  LINE = "5", // Line
  RENKO = "6", // Renko
  KAGI = "7", // Kagi
  POINT_AND_FIGURE = "8", // Point & Figure
  LINE_BREAK = "9", // Line Break
}

// https://tradingview-widgets.jorrinkievit.xyz/docs/components/AdvancedRealTimeChartWidget/
export default function AdvancedRealTimeChart({
  symbol,
  style = AdvancedRealTimeChartStyle.AREA,
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
      style={style}
      allow_symbol_change={allow_symbol_change}
      theme={theme}
      autosize={autosize}
      hotlist={hotlist}
      copyrightStyles={copyrightStyles}
      {...rest}
    />
  );
}
