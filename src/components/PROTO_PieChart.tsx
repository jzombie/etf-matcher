import React, { PureComponent } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import type { RustServiceCacheDetail } from "@src/store";
import useStoreStateReader from "@hooks/useStoreStateReader";

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
          // outerRadius={80}
          fill="#8884d8"
          label
        >
          {cacheDetails.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {
          // TODO: Apply stying
        }
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

// export default class CachePieChart extends PureComponent {
//   render() {
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <PieChart>
//           <Pie
//             data={cacheData}
//             dataKey="size"
//             nameKey="key"
//             cx="50%"
//             cy="50%"
//             outerRadius={150}
//             fill="#8884d8"
//             label
//           >
//             {cacheData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//           <Tooltip />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   }
// }
