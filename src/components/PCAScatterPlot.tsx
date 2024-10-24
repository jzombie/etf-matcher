import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Divider, Typography } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import {
  RustServiceTickerDetail,
  fetchEuclideanByTicker,
  fetchTickerDetail,
} from "@services/RustService";
import {
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { NameType } from "recharts/types/component/DefaultTooltipContent";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";

import AvatarLogo from "./AvatarLogo";

const RADIAL_STROKE_COLOR = "#999";
const RADIAL_FILL_COLOR = "none";
const YELLOW_DOT_COLOR = "yellow";
const YELLOW_DOT_RADIUS = 5;

// Prevent coordinates from overflowing radial chart
const MAX_VALUE_MULT_BUFFER = 1.1;

export type PCAScatterPlotProps = {
  tickerDetail: RustServiceTickerDetail;
};

type ChartVectorDistance = {
  tickerDetail: RustServiceTickerDetail;
  pc1: number;
  pc2: number;
};

// This component mimics a radial scatter plot, which `ReCharts` doesn't directly support.
// The coordinates are based directly on the PCA coordinates.
export default function PCAScatterPlot({ tickerDetail }: PCAScatterPlotProps) {
  const [chartData, setChartData] = useState<ChartVectorDistance[] | null>(
    null,
  );

  useEffect(() => {
    if (tickerDetail) {
      fetchEuclideanByTicker(tickerDetail.ticker_id)
        .then((tickerDistances) =>
          Promise.allSettled(
            tickerDistances.map(async (item) => {
              const tickerDetail = await fetchTickerDetail(item.ticker_id);
              return {
                tickerDetail,
                pc1: item.translated_pca_coords[0],
                pc2: item.translated_pca_coords[1],
              };
            }),
          ),
        )
        .then((results) => {
          // Filter out failed promises
          const successfulResults = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value); // Extract the `value` from the fulfilled promises
          setChartData(successfulResults);
        });
    }
  }, [tickerDetail]);

  const navigateToSymbol = useTickerSymbolNavigation();

  const handleClick = useCallback(
    (item: ChartVectorDistance) => {
      customLogger.debug(
        `Ticker: ${item.tickerDetail.symbol}\nPC1: ${item.pc1}\nPC2: ${item.pc2}`,
      );

      navigateToSymbol(item.tickerDetail.symbol);
    },
    [navigateToSymbol],
  );

  // Calculate domain for the axes based on the chart data to ensure (0,0) is centered
  const maxValue = useMemo(
    () =>
      chartData
        ? Math.max(
            ...chartData.map(({ pc1, pc2 }) =>
              Math.max(Math.abs(pc1), Math.abs(pc2)),
            ),
          ) * MAX_VALUE_MULT_BUFFER
        : 0,
    [chartData],
  );

  if (!chartData) {
    return null;
  }

  return (
    <AutoScaler style={{ height: 300 }}>
      <ScatterChart
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        width={400}
        height={400}
      >
        <XAxis
          type="number"
          dataKey="pc1"
          domain={[-maxValue, maxValue]}
          name="PC1"
          hide
        />
        <YAxis
          type="number"
          dataKey="pc2"
          domain={[-maxValue, maxValue]}
          name="PC2"
          hide
        />
        {renderRadialOverlay()}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Scatter
          name="10-K Proximity Tickers"
          data={chartData}
          fill="#8884d8"
          onClick={handleClick}
          shape={CustomPoint}
        />
      </ScatterChart>
    </AutoScaler>
  );
}

const renderRadialOverlay = () => {
  const cx = "50%";
  const cy = "50%";

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r="50%"
        stroke={RADIAL_STROKE_COLOR}
        fill={RADIAL_FILL_COLOR}
      />
      <circle
        cx={cx}
        cy={cy}
        r="40%"
        stroke={RADIAL_STROKE_COLOR}
        fill={RADIAL_FILL_COLOR}
      />
      <circle
        cx={cx}
        cy={cy}
        r="30%"
        stroke={RADIAL_STROKE_COLOR}
        fill={RADIAL_FILL_COLOR}
      />
      <circle
        cx={cx}
        cy={cy}
        r="20%"
        stroke={RADIAL_STROKE_COLOR}
        fill={RADIAL_FILL_COLOR}
      />
      <circle
        cx={cx}
        cy={cy}
        r="10%"
        stroke={RADIAL_STROKE_COLOR}
        fill={RADIAL_FILL_COLOR}
      />
      <circle cx={cx} cy={cy} r={YELLOW_DOT_RADIUS} fill={YELLOW_DOT_COLOR} />
    </g>
  );
};

function CustomTooltip({ active, payload }: TooltipProps<number, NameType>) {
  if (active && payload && payload.length) {
    const { tickerDetail, pc1, pc2 } = payload[0].payload;

    return (
      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: 2,
          borderRadius: 4,
          maxWidth: 250,
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <AvatarLogo tickerDetail={tickerDetail} />
          <Typography variant="h6" color="primary" ml={1}>
            {tickerDetail?.symbol}
          </Typography>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" color="textSecondary">
          {tickerDetail?.company_name}
        </Typography>

        {tickerDetail?.sector_name && (
          <Typography variant="subtitle2" color="textSecondary">
            Sector: {tickerDetail?.sector_name}
          </Typography>
        )}

        {tickerDetail?.industry_name && (
          <Typography variant="subtitle2" color="textSecondary">
            Industry: {tickerDetail?.industry_name}
          </Typography>
        )}

        <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        <Typography variant="body2" color="textSecondary">
          PC1: {pc1.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          PC2: {pc2.toFixed(2)}
        </Typography>
      </Box>
    );
  }

  return null;
}

type CustomPointProps = {
  cx?: number;
  cy?: number;
  payload?: ChartVectorDistance;
};

function CustomPoint({ cx = 0, cy = 0, payload }: CustomPointProps) {
  return (
    <g style={{ cursor: "pointer" }}>
      <circle cx={cx} cy={cy} r={6} fill="#8884d8" />
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#ccc">
        {payload?.tickerDetail?.symbol}
      </text>
    </g>
  );
}
