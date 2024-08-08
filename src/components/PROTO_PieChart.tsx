import React from "react";

import type { RustServiceCacheDetail } from "@src/types";
import {
  Cell,
  LabelList,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import useStoreStateReader from "@hooks/useStoreStateReader";

import formatByteSize from "@utils/formatByteSize";

// TODO: Centralize somewhere else
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

// Define a type for the data entries
interface CacheDetail {
  name: RustServiceCacheDetail["name"];
  size: RustServiceCacheDetail["size"];
}

// Define a type for the props used in the customized label
interface CustomizedLabelProps extends PieLabelRenderProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  payload: CacheDetail;
}

const renderCustomizedLabel = (props: CustomizedLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } =
    props;
  const RADIAN = Math.PI / 180;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Show label if space allows
  const isSpaceAvailable = percent > 0.05; // Adjust this threshold as needed

  if (isSpaceAvailable) {
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${payload.name}: ${formatByteSize(payload.size)}`}
      </text>
    );
  }
  return null;
};

export default function CachePieChart() {
  const { cacheDetails } = useStoreStateReader("cacheDetails");

  // Provide a default value if cacheDetails is undefined
  const data: CacheDetail[] = cacheDetails || [];

  return (
    <ResponsiveContainer height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="size"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label={renderCustomizedLabel}
        >
          <LabelList
            dataKey="size"
            // @ts-expect-error FIXME: Having a hard time debugging this type
            content={renderCustomizedLabel}
          />
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${formatByteSize(value as number)}`,
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
