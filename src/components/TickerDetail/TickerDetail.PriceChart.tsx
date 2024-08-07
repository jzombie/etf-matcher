import React from "react";

import { Box } from "@mui/material";

import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { MiniChart } from "react-ts-tradingview-widgets";

export type PriceChartProps = {
  formattedSymbolWithExchange: string;
};

export default function PriceChart({
  formattedSymbolWithExchange,
}: PriceChartProps) {
  return (
    <Box sx={{ height: 200 }}>
      <MiniChart
        symbol={formattedSymbolWithExchange}
        colorTheme="dark"
        width="100%"
        height="100%"
        copyrightStyles={tradingViewCopyrightStyles}
        // TODO: Add date-range selection
        dateRange="ALL"
      />
    </Box>
  );
}
