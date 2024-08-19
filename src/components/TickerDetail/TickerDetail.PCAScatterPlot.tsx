import React, { useCallback, useEffect, useState } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";
import { RustServiceTickerDetail } from "@src/types";
import {
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { NameType } from "recharts/types/component/DefaultTooltipContent";

import customLogger from "@utils/customLogger";

const RADIAL_STROKE_COLOR = "#999";

export type PCAScatterPlotProps = {
  tickerDetail: RustServiceTickerDetail;
};

type ChartVectorDistance = {
  ticker_id: RustServiceTickerDetail["ticker_id"];
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
      store
        .fetchClosestTickers(tickerDetail.ticker_id)
        .then((data) =>
          data.map((item) => ({
            ticker_id: item.ticker_id,
            pc1: item.translated_pca_coords[0],
            pc2: item.translated_pca_coords[1],
          })),
        )
        .then(setChartData);
    }
  }, [tickerDetail]);

  const handleClick = useCallback((item: ChartVectorDistance) => {
    customLogger.debug(
      `Ticker ID: ${item.ticker_id}\nPC1: ${item.pc1}\nPC2: ${item.pc2}`,
    );
  }, []);

  if (!chartData) {
    return null;
  }

  // Custom tooltip content
  // https://github.com/recharts/recharts/issues/2796
  const CustomTooltip: React.FC<TooltipProps<number, NameType>> = ({
    active,
    payload,
  }) => {
    if (active && payload && payload.length) {
      const { ticker_id, pc1, pc2 } = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p>{`Ticker ID: ${ticker_id}`}</p>
          <p>{`PC1: ${pc1}`}</p>
          <p>{`PC2: ${pc2}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom scatter point content
  const renderCustomPoint = (props: {
    cx?: number;
    cy?: number;
    payload?: ChartVectorDistance;
  }): JSX.Element => {
    // FIXME: Fighting with these types
    // eslint-disable-next-line react/prop-types
    const { cx = 0, cy = 0, payload } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#8884d8" />
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#333">
          {
            // FIXME: Fighting with these types
            // eslint-disable-next-line react/prop-types
            payload?.ticker_id
          }
        </text>
      </g>
    );
  };

  return (
    <AutoScaler>
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        width={400}
        height={400}
      >
        <XAxis type="number" dataKey="pc1" name="PC1" hide />
        <YAxis type="number" dataKey="pc2" name="PC2" hide />
        {renderRadialOverlay()}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Scatter
          name="10-K Proximity Tickers"
          data={chartData}
          fill="#8884d8"
          onClick={(data) => handleClick(data)}
          shape={renderCustomPoint} // Custom point rendering
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
