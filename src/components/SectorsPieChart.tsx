import React, { useEffect, useMemo } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import customLogger from "@utils/customLogger";
import getSectorColor from "@utils/string/getSectorColor";

import NoInformationAvailableAlert from "./NoInformationAvailableAlert";

export type SectorsPieChartProps = {
  majorSectorDistribution: Array<{
    major_sector_name: string;
    weight: number;
  }>;
};

export default function SectorsPieChart({
  majorSectorDistribution,
}: SectorsPieChartProps) {
  const data = useMemo(() => {
    const data =
      majorSectorDistribution?.map((sector) => ({
        name: sector.major_sector_name,
        value: sector.weight * 100, // Normalize the weight (as a percentage)
      })) || [];

    return data.sort((a, b) => b.value - a.value);
  }, [majorSectorDistribution]);

  useEffect(() => {
    customLogger.debug("Pie Chart Data: ", data);
  }, [data]);

  if (!data.length) {
    return (
      <Center>
        <NoInformationAvailableAlert>
          No sector allocation information available.
        </NoInformationAvailableAlert>
      </Center>
    );
  }

  return (
    // Note: `AutoScaler` is used instead of `ResponsiveContainer` to better
    // control the layout with the app.
    <AutoScaler>
      {
        // Note: These dimensions are used to maintain aspect ratio.
      }
      <PieChart width={400} height={320}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          label={({ name: sectorName, _percent, cx, x, y }) => {
            const maxAllowedLabelWidth = 80; // Maximum width for the label in pixels

            const charWidthEstimate = 8; // Approximate width of a character in pixels

            // Calculate the maximum number of characters allowed based on the width
            const maxCharsAllowed = maxAllowedLabelWidth / charWidthEstimate;

            // Truncate the sector name if it exceeds the maximum character count
            const truncatedText =
              sectorName.length > maxCharsAllowed
                ? `${sectorName.slice(0, maxCharsAllowed)}...`
                : sectorName;

            return (
              <text
                x={x}
                y={y}
                textAnchor={x > cx ? "start" : "end"} // Adjust text alignment
                dominantBaseline="central"
                style={{
                  fontSize: "14px",
                  fill: getSectorColor(sectorName), // Use sector-specific color
                }}
              >
                {truncatedText}
              </text>
            );
          }}
          // labelStyle={{ fontSize: "12px", fill: "#333" }} // Optional: Customize label style
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getSectorColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
      </PieChart>
    </AutoScaler>
  );
}
