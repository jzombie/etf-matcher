import React, { useEffect, useState } from "react";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { getAllMajorSectors } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

type SectorData = {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
};

export default function SectorsRadarChart() {
  const [data, setData] = useState<SectorData[]>([]);

  useEffect(() => {
    getAllMajorSectors().then((sectorMap) => {
      // TODO: Implement actual data

      customLogger.debug(sectorMap);

      // Dynamically generate the data
      const generatedData = Array.from(sectorMap).map(([_, sectorName]) => ({
        subject: sectorName,
        A: Math.floor(Math.random() * 150), // Random value for A (TODO: Update logic)
        B: Math.floor(Math.random() * 150), // Random value for B (TODO: Update logic)
        fullMark: 150,
      }));

      setData(generatedData);
    });
  }, []);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 150]} />
        <Radar
          name="A"
          dataKey="A"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Radar
          name="B"
          dataKey="B"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
