import React, { useCallback, useEffect, useMemo } from "react";

import { Box, Divider, Typography } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import {
  RustServiceTickerDetail,
  RustServiceTickerDistance,
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

import usePromise from "@hooks/usePromise";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";

import AvatarLogo from "./AvatarLogo";
import NetworkProgressIndicator from "./NetworkProgressIndicator";
import NoInformationAvailableAlert from "./NoInformationAvailableAlert";

const RADIAL_STROKE_COLOR = "#999";
const RADIAL_FILL_COLOR = "none";
const YELLOW_DOT_COLOR = "yellow";
const YELLOW_DOT_RADIUS = 5;

// Prevent coordinates from overflowing radial chart
const MAX_VALUE_MULT_BUFFER = 1.1;

type ChartVectorDistance = {
  tickerDetail: RustServiceTickerDetail;
  pc1: number;
  pc2: number;
};

export type TickerPCAScatterPlotProps = {
  // Where `tickerDistances` is obtained from `fetchEuclideanByTicker`
  tickerDistances?: RustServiceTickerDistance[] | null;
};

// This component mimics a radial scatter plot, which `ReCharts` doesn't directly support.
// The coordinates are based directly on the PCA coordinates.
export default function TickerPCAScatterPlot({
  tickerDistances,
}: TickerPCAScatterPlotProps) {
  const {
    data: chartData,
    isPending: isLoading,
    execute: executeFetchDetail,
  } = usePromise<ChartVectorDistance[] | null, [RustServiceTickerDistance[]]>({
    fn: (tickerDistances) => {
      return Promise.allSettled(
        tickerDistances.map(async (item) => {
          const tickerDetail = await fetchTickerDetail(item.ticker_id);
          return {
            tickerDetail,
            pc1: item.translated_pca_coords[0],
            pc2: item.translated_pca_coords[1],
          };
        }),
      ).then((results) => {
        // Filter out failed promises
        const successfulResults = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value); // Extract the `value` from the fulfilled promises

        return successfulResults;
      });
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerDistances) {
      executeFetchDetail(tickerDistances);
    }
  }, [tickerDistances, executeFetchDetail]);

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
    return (
      <Center>
        <NoInformationAvailableAlert>
          No chart data available.
        </NoInformationAvailableAlert>
      </Center>
    );
  }

  return (
    // Note: `AutoScaler` is used instead of `ResponsiveContainer` to better
    //control the layout with the app.
    <Full>
      <AutoScaler>
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
      <Cover clickThrough>
        {isLoading && (
          <Center>
            <NetworkProgressIndicator />
          </Center>
        )}
      </Cover>
    </Full>
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
