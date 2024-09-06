import React, { useEffect, useMemo } from "react";

import { COLOR_WHEEL_COLORS } from "@src/constants";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { RustServiceETFAggregateDetail } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

export type SectorsPieChartProps = {
  majorSectorDistribution: RustServiceETFAggregateDetail["major_sector_distribution"];
};

export default function SectorsPieChart({
  majorSectorDistribution,
}: SectorsPieChartProps) {
  // Transform the majorSectorDistribution data into the format the pie chart expects
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
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={110} // Increase the outer radius for better spacing
          innerRadius={40} // Optional: Add an inner radius for a doughnut style
          fill="#8884d8"
          label={({ name, percent }) =>
            percent > 0.03 ? `${name}: ${(percent * 100).toFixed(1)}%` : ""
          } // Hide labels for sectors with less than 3%
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLOR_WHEEL_COLORS[index % COLOR_WHEEL_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
