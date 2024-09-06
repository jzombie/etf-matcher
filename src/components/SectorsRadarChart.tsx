import React, { useEffect, useMemo } from "react";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import type { RustServiceETFAggregateDetail } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

export type SectorsRadarChartProps = {
  majorSectorDistribution: RustServiceETFAggregateDetail["major_sector_distribution"];
};

type SectorData = {
  subject: string;
  A: number; // Weight for sector A
  fullMark: number; // Max mark, could be static or dynamic
};

export default function SectorsRadarChart({
  majorSectorDistribution,
}: SectorsRadarChartProps) {
  // Transform the majorSectorDistribution data into the format the radar chart expects
  const data: SectorData[] = useMemo(
    () =>
      majorSectorDistribution?.map((sector) => ({
        subject: sector.major_sector_name, // Sector name
        A: sector.weight * 100, // Normalize the weight (as a percentage)
        fullMark: 100, // Assuming 100 is the full mark for the radar chart
      })) || [],
    [majorSectorDistribution],
  );

  // TODO: Remove
  useEffect(() => {
    customLogger.debug("Radar Chart Data: ", data);
  }, [data]);

  if (!data.length) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Sector Weight"
          dataKey="A"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
