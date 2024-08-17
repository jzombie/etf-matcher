import React, { useCallback, useEffect, useState } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";
import { RustServiceTickerDetail } from "@src/types";
import {
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import customLogger from "@utils/customLogger";

const RADIAL_STROKE_COLOR = "#999";

export type PCAScatterPlotProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function PCAScatterPlot({ tickerDetail }: PCAScatterPlotProps) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (tickerDetail) {
      store
        .PROTO_fetchClosestTickers(tickerDetail.ticker_id)
        .then((data) =>
          data.map((item) => ({
            ticker_id: item.ticker_id,
            pc1: item.translated_pca_coordinates[0],
            pc2: item.translated_pca_coordinates[1],
          })),
        )
        .then(setChartData);
    }
  }, [tickerDetail]);

  const handleClick = useCallback((chartData) => {
    // const handleClick = (data) => {
    customLogger.debug(
      `Ticker ID: ${chartData.ticker_id}\nPC1: ${chartData.pc1}\nPC2: ${chartData.pc2}`,
    );
  }, []);

  if (!chartData) {
    return null;
  }

  // Note: `AutoScaler` is usded instead of `ResponsiveContainer` to help prevent the chart from clipping.
  return (
    <AutoScaler>
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        width={400}
        height={400}
      >
        {
          // Note: The X and Y axis must be present for the chart to understand its own coordinate system.
          // If they are visible, the radial overlay is offcentered.
        }
        <XAxis type="number" dataKey="pc1" name="PC1" hide />
        <YAxis type="number" dataKey="pc2" name="PC2" hide />
        {renderRadialOverlay()}
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter
          name="10-K Proximity Tickers"
          data={chartData}
          fill="#8884d8"
          onClick={(data) => handleClick(data)}
        />
      </ScatterChart>
    </AutoScaler>
  );
}

const renderRadialOverlay = () => {
  return (
    <g>
      <circle
        cx="50%"
        cy="50%"
        r="50%"
        stroke={RADIAL_STROKE_COLOR}
        fill="none"
      />
      <circle
        cx="50%"
        cy="50%"
        r="40%"
        stroke={RADIAL_STROKE_COLOR}
        fill="none"
      />
      <circle
        cx="50%"
        cy="50%"
        r="30%"
        stroke={RADIAL_STROKE_COLOR}
        fill="none"
      />
      <circle
        cx="50%"
        cy="50%"
        r="20%"
        stroke={RADIAL_STROKE_COLOR}
        fill="none"
      />
      <circle
        cx="50%"
        cy="50%"
        r="10%"
        stroke={RADIAL_STROKE_COLOR}
        fill="none"
      />
      {/* Add a yellow dot in the center */}
      <circle cx="50%" cy="50%" r="5" fill="yellow" />
    </g>
  );
};
