import React, { useCallback, useState } from "react";

import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Box, ButtonGroup, IconButton, Typography } from "@mui/material";

import { DEFAULT_CURRENCY_CODE } from "@src/constants";
import { COLOR_WHEEL_COLORS } from "@src/constants";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import formatCurrency from "@utils/string/formatCurrency";

// TODO: Refactor
const TICK_COLOR = "#999";

export function createChartData(
  currentValue: number | undefined,
  year1Value: number | undefined,
  year2Value: number | undefined,
  year3Value: number | undefined,
  year4Value: number | undefined,
) {
  return [
    { year: "4 Years Ago", value: year4Value || 0 },
    { year: "3 Years Ago", value: year3Value || 0 },
    { year: "2 Years Ago", value: year2Value || 0 },
    { year: "1 Year Ago", value: year1Value || 0 },
    { year: "Current", value: currentValue || 0 },
  ];
}

export type FinancialBarLineChartProps = {
  title: string;
  chartData: { year: string; value: number }[];
  colorIndex: number;
  currencyCode?: string;
};

export default function FinancialBarLineChart({
  title,
  chartData,
  colorIndex,
  currencyCode = DEFAULT_CURRENCY_CODE,
}: FinancialBarLineChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("bar");

  const handleChartTypeChange = (type: "line" | "bar") => {
    setChartType(type);
  };

  const darkenColor = useCallback((color: string) => {
    // Simple darkening function (this can be improved)
    let darkenedColor = color.replace(/^#/, "");
    if (darkenedColor.length === 6) {
      darkenedColor = darkenedColor.replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) - 50)).toString(16)
        ).substr(-2),
      );
    }
    return `#${darkenedColor}`;
  }, []);

  // Function to determine color based on the value (positive/negative) and colorIndex
  const getColorBasedOnValue = useCallback(
    (value: number) => {
      const baseColor =
        COLOR_WHEEL_COLORS[colorIndex % COLOR_WHEEL_COLORS.length];
      return value >= 0 ? baseColor : darkenColor(baseColor); // Apply darkening for negative values
    },
    [colorIndex, darkenColor],
  );

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ marginBottom: 2 }}
      >
        <Typography variant="subtitle2">{title}</Typography>
        <ButtonGroup>
          <IconButton
            disabled={chartType === "line"}
            onClick={() => handleChartTypeChange("line")}
          >
            <ShowChartIcon />
          </IconButton>
          <IconButton
            disabled={chartType === "bar"}
            onClick={() => handleChartTypeChange("bar")}
          >
            <BarChartIcon />
          </IconButton>
        </ButtonGroup>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === "line" ? (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={(props) => <CustomTick {...props} />} />
            <YAxis
              tickFormatter={(value: number) =>
                formatCurrency(currencyCode || DEFAULT_CURRENCY_CODE, value)
              }
              padding={{ top: 20, bottom: 0 }}
              tick={{ fill: TICK_COLOR }}
            />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(currencyCode || DEFAULT_CURRENCY_CODE, value)
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getColorBasedOnValue(
                chartData.some((d) => d.value < 0) ? -1 : 1,
              )}
            />
          </LineChart>
        ) : (
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={(props) => <CustomTick {...props} />} />
            <YAxis
              tickFormatter={(value: number) =>
                formatCurrency(currencyCode || DEFAULT_CURRENCY_CODE, value)
              }
              padding={{ top: 20, bottom: 0 }}
              tick={{ fill: TICK_COLOR }}
            />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(currencyCode || DEFAULT_CURRENCY_CODE, value)
              }
            />
            <Bar
              dataKey="value"
              fill={getColorBasedOnValue(
                chartData.some((d) => d.value < 0) ? -1 : 1,
              )}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}

type CustomTickProps = {
  x: number;
  y: number;
  payload: {
    value: string;
  };
};

function CustomTick({ x, y, payload }: CustomTickProps) {
  const offsetX = 45; // Adjust this value to move right
  const offsetY = 5; // Adjust this value to move down

  return (
    <text
      x={x + offsetX} // Offset the x position
      y={y + offsetY} // Offset the y position
      textAnchor="end"
      transform={`rotate(-15, ${x + offsetX}, ${y + offsetY})`}
      fill={TICK_COLOR}
    >
      {payload.value !== "Current" ? payload.value : null}
    </text>
  );
}
