import React, { PureComponent } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const cacheData = [
  {
    key: "/data/symbol_detail.0.enc",
    size: 56688,
    age: 99456,
    last_accessed: 99456,
    access_count: 1,
  },
  {
    key: "/data/symbol_search_dict.enc",
    size: 530948,
    age: 105356,
    last_accessed: 103277,
    access_count: 3,
  },
  {
    key: "/data/symbol_detail_index.enc",
    size: 459,
    age: 99556,
    last_accessed: 99556,
    access_count: 1,
  },
  {
    key: "/data/symbol_etf_holders.18.enc",
    size: 69977,
    age: 101257,
    last_accessed: 101257,
    access_count: 1,
  },
  {
    key: "/data/symbol_etf_holders_index.enc",
    size: 3320,
    age: 101348,
    last_accessed: 101348,
    access_count: 1,
  },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

export default class CachePieChart extends PureComponent {
  render() {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={cacheData}
            dataKey="size"
            nameKey="key"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {cacheData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
}
