import React from "react";

import {
  TRADING_VIEW_COPYRIGHT_STYLES,
  TRADING_VIEW_THEME,
} from "@src/constants";
import {
  TickerTape as LibTickerTape,
  TickerTapeProps as LibTickerTapeProps,
  TickerTapeSymbol as LibTickerTapeSymbol,
} from "react-ts-tradingview-widgets";

export type TickerTapeProps = LibTickerTapeProps;
export type TickerTapeSymbol = LibTickerTapeSymbol;

// https://tradingview-widgets.jorrinkievit.xyz/docs/components/TickerTape
export default function TickerTape({
  symbols,
  colorTheme = TRADING_VIEW_THEME,
  copyrightStyles = TRADING_VIEW_COPYRIGHT_STYLES,
  ...rest
}: TickerTapeProps) {
  return (
    <LibTickerTape
      symbols={symbols}
      colorTheme={colorTheme}
      copyrightStyles={copyrightStyles}
      {...rest}
    />
  );
}
