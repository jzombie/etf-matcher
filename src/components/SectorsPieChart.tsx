import React, { useEffect, useMemo, useState } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

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

  // Define legend layout based on screen size
  const getLegendLayout = () => {
    if (window.innerWidth < 768) {
      return {
        layout: "horizontal" as const,
        verticalAlign: "bottom" as const,
        align: "center" as const,
      };
    }
    return {
      layout: "vertical" as const,
      verticalAlign: "middle" as const,
      align: "right" as const,
    };
  };

  const [legendLayout, setLegendLayout] = useState(getLegendLayout());

  // Update the legend layout when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setLegendLayout(getLegendLayout());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    <AutoScaler>
      <PieChart width={500} height={200}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx={legendLayout.layout === "horizontal" ? "50%" : "55%"}
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          labelLine={false} // Disable connecting lines for labels
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getSectorColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
        <Legend
          layout={legendLayout.layout}
          verticalAlign={legendLayout.verticalAlign}
          align={legendLayout.align}
          wrapperStyle={{
            paddingLeft: legendLayout.layout === "vertical" ? "20px" : "0px",
          }}
        />
      </PieChart>
    </AutoScaler>
  );
}
