import React, { useEffect } from "react";

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

// TODO: Don't hardcode
const data = [
  {
    subject: "Basic Materials",
    A: 120,
    B: 110,
    fullMark: 150,
  },
  {
    subject: "Consumer Discretionary",
    A: 98,
    B: 130,
    fullMark: 150,
  },
  {
    subject: "Consumer Staples",
    A: 86,
    B: 130,
    fullMark: 150,
  },
  {
    subject: "Energy",
    A: 99,
    B: 100,
    fullMark: 150,
  },
  {
    subject: "Financials",
    A: 85,
    B: 90,
    fullMark: 150,
  },
  {
    subject: "Healthcare",
    A: 65,
    B: 85,
    fullMark: 150,
  },
  {
    subject: "Industrials",
    A: 35,
    B: 25,
    fullMark: 150,
  },
  {
    subject: "Information Technology",
    A: 10,
    B: 90,
    fullMark: 150,
  },
  {
    subject: "Real Estate",
    A: 45,
    B: 95,
    fullMark: 150,
  },
  {
    subject: "Telecommunication Services",
    A: 42,
    B: 93,
    fullMark: 150,
  },
  {
    subject: "Utilities",
    A: 45,
    B: 150,
    fullMark: 150,
  },
];

export default function SectorsRadarChart() {
  // TODO: Build out
  useEffect(() => {
    getAllMajorSectors().then(customLogger.debug);
  }, []);

  return (
    // TODO: Don't hardcode
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
        {/* <Radar
          name="B"
          dataKey="B"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        /> */}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
