import React, { useEffect, useMemo } from "react";

import { COLOR_WHEEL_COLORS } from "@src/constants";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import customLogger from "@utils/customLogger";

export type SectorsPieChartProps = {
  majorSectorDistribution: Array<{
    major_sector_name: string;
    weight: number;
  }>;
};

export default function SectorsPieChart({
  majorSectorDistribution,
}: SectorsPieChartProps) {
  const data = useMemo(
    () =>
      majorSectorDistribution?.map((sector) => ({
        name: sector.major_sector_name,
        value: sector.weight * 100, // Normalize the weight (as a percentage)
      })) || [],
    [majorSectorDistribution],
  );

  useEffect(() => {
    customLogger.debug("Pie Chart Data: ", data);
  }, [data]);

  if (!data.length) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="55%" // Adjusted to give more space for the legend
          cy="50%"
          outerRadius={100} // Adjust outer radius for more space
          innerRadius={50}
          labelLine={false} // Disable connecting lines
          // label={({ name, percent }) =>
          //   percent > 0.03 ? `${name}: ${(percent * 100).toFixed(1)}%` : ""
          // }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLOR_WHEEL_COLORS[index % COLOR_WHEEL_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            paddingLeft: "20px", // Add space between the chart and legend
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
