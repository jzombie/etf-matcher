import React, { useMemo } from "react";

import type { RustServiceCacheDetail } from "@services/RustService";
import { COLOR_WHEEL_COLORS } from "@src/constants";
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

import formatByteSize from "@utils/string/formatByteSize";

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
  payload: GroupedCacheDetail;
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
        {`${payload.group}: ${formatByteSize(payload.size)}`}
      </text>
    );
  }
  return null;
};

// Define a type for grouped data
interface GroupedCacheDetail {
  group: string;
  size: number;
}

// FIXME: This implementation could be improved
const groupCacheDetails = (
  cacheDetails: CacheDetail[],
): GroupedCacheDetail[] => {
  const groupMap: { [key: string]: number } = {};

  cacheDetails.forEach((detail) => {
    // Extract the group from the name
    const pathParts = detail.name.split("/");
    const group =
      pathParts.length > 3
        ? pathParts[0] + "/" + pathParts[1] + "/" + pathParts[2] // Use subfolder if it exists
        : detail.name.split(".")[0]; // Otherwise use part before the first dot

    if (groupMap[group]) {
      groupMap[group] += detail.size;
    } else {
      groupMap[group] = detail.size;
    }
  });

  return Object.keys(groupMap).map((group) => ({
    group,
    size: groupMap[group],
  }));
};

export default function CachePieChart() {
  const { cacheDetails } = useStoreStateReader("cacheDetails");

  // Group and aggregate the data
  const groupedData = useMemo(
    () => groupCacheDetails((cacheDetails as CacheDetail[]) || []),
    [cacheDetails],
  );

  return (
    <ResponsiveContainer height={300}>
      <PieChart>
        <Pie
          data={groupedData}
          dataKey="size"
          nameKey="group"
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
          {groupedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLOR_WHEEL_COLORS[index % COLOR_WHEEL_COLORS.length]}
            />
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
