import React, { useState } from "react";

import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Box, ButtonGroup, IconButton, Typography } from "@mui/material";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
} from "@src/types";
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

import formatCurrency from "@utils/formatCurrency";

export type RenderChartProps = {
  title: string;
  chartData: { year: string; value: number }[];
  detail: RustServiceTicker10KDetail | RustServiceETFAggregateDetail;
};

export default function RenderChart({
  title,
  chartData,
  detail,
}: RenderChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const handleChartTypeChange = (type: "line" | "bar") => {
    setChartType(type);
  };

  const isETFAggregateDetail = (
    data: RustServiceTicker10KDetail | RustServiceETFAggregateDetail,
  ): data is RustServiceETFAggregateDetail => {
    return "avg_revenue_current" in data;
  };

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
            color={chartType === "line" ? "primary" : "default"}
            onClick={() => handleChartTypeChange("line")}
          >
            <ShowChartIcon />
          </IconButton>
          <IconButton
            color={chartType === "bar" ? "primary" : "default"}
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
                formatCurrency(
                  isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                  value,
                )
              }
              padding={{ top: 20, bottom: 0 }}
            />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(
                  isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                  value,
                )
              }
            />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
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
                formatCurrency(
                  isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                  value,
                )
              }
              padding={{ top: 20, bottom: 0 }}
            />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(
                  isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                  value,
                )
              }
            />
            <Bar dataKey="value" fill="#8884d8" />
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
      fill="#666" // Set the text color (adjust color as needed)
    >
      {payload.value !== "Current" ? payload.value : null}
    </text>
  );
}
