import React, { useState } from "react";

import { Box, Button, ButtonGroup, Typography } from "@mui/material";

import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { MiniChart } from "react-ts-tradingview-widgets";
import type { DateRange } from "react-ts-tradingview-widgets";

export type PriceChartProps = {
  formattedSymbolWithExchange: string;
};

const dateRanges: DateRange[] = ["1D", "1M", "3M", "12M", "60M", "ALL"];

export default function PriceChart({
  formattedSymbolWithExchange,
}: PriceChartProps) {
  const [dateRange, setDateRange] = useState<DateRange>("1M");

  const handleDateRangeChange = (range: string) => {
    setDateRange(range as DateRange);
  };

  return (
    <Box>
      <Box>
        <Typography variant="h6" sx={{ float: "left", paddingLeft: 1.5 }}>
          Price Chart
        </Typography>
        <ButtonGroup
          sx={{ float: "right" }}
          variant="outlined"
          aria-label="outlined button group"
        >
          {dateRanges.map((range) => (
            <Button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              variant={dateRange === range ? "contained" : "outlined"}
            >
              {range}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <Box sx={{ height: 200 }}>
        <MiniChart
          symbol={formattedSymbolWithExchange}
          colorTheme="dark"
          width="100%"
          height="100%"
          copyrightStyles={tradingViewCopyrightStyles}
          dateRange={dateRange}
        />
      </Box>
    </Box>
  );
}
