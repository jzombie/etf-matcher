import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import useStoreStateReader from "@hooks/useStoreStateReader";
import formatByteSize from "@utils/formatByteSize"; // Import the utility function

// TODO: Centralize somewhere else
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

export default function CachePieChart() {
  const { cacheDetails } = useStoreStateReader("cacheDetails");

  return (
    <ResponsiveContainer height={200}>
      <PieChart>
        <Pie
          data={cacheDetails}
          dataKey="size"
          nameKey="key"
          cx="50%"
          cy="50%"
          outerRadius={50}
          fill="#8884d8"
          label={(entry) => `${entry.key}: ${formatByteSize(entry.size)}`}
        >
          {cacheDetails.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatByteSize(value as number)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
