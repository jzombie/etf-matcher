import React from "react";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { ticker_id: 2221, pc1: -0.950015, pc2: -0.763076 },
  { ticker_id: 2222, pc1: -1.297482, pc2: -0.191121 },
  { ticker_id: 2223, pc1: -1.343009, pc2: -0.171777 },
  // More data points...
];

const handleClick = (data) => {
  alert(`Ticker ID: ${data.ticker_id}\nPC1: ${data.pc1}\nPC2: ${data.pc2}`);
  // You could also navigate to a different page or show a modal with more details
};

const PCAScatterPlot = () => (
  <ResponsiveContainer width="100%" height={400}>
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid />
      <XAxis type="number" dataKey="pc1" name="PC1" />
      <YAxis type="number" dataKey="pc2" name="PC2" />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
      <Legend />
      <Scatter
        name="Tickers"
        data={data}
        fill="#8884d8"
        onClick={(data) => handleClick(data)}
      />
    </ScatterChart>
  </ResponsiveContainer>
);

export default PCAScatterPlot;
