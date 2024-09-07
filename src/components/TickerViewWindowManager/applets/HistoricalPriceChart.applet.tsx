import React, { useMemo, useState } from "react";

import { Box, Button, ButtonGroup } from "@mui/material";

import { TRADING_VIEW_COPYRIGHT_STYLES } from "@src/constants";
import { MiniChart } from "react-ts-tradingview-widgets";
import type { DateRange } from "react-ts-tradingview-widgets";

import { RustServiceTickerDetail } from "@utils/callRustService";
import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

export type HistoricalPriceChartProps = {
  tickerDetail: RustServiceTickerDetail;
};

const dateRanges: DateRange[] = ["1D", "1M", "3M", "12M", "60M", "ALL"];

export default function HistoricalPriceChart({
  tickerDetail,
}: HistoricalPriceChartProps) {
  const formattedSymbolWithExchange = useMemo(
    () => formatSymbolWithExchange(tickerDetail),
    [tickerDetail],
  );

  const [dateRange, setDateRange] = useState<DateRange>("1M");

  const handleDateRangeChange = (range: string) => {
    setDateRange(range as DateRange);
  };

  return (
    <Box>
      <Box sx={{ overflow: "auto" }}>
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
          copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
          dateRange={dateRange}
        />
      </Box>
    </Box>
  );
}
