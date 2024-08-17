import React, { useCallback } from "react";

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

export default function PCAScatterPlot() {
  const handleClick = useCallback((data) => {
    // const handleClick = (data) => {
    console.debug(
      `Ticker ID: ${data.ticker_id}\nPC1: ${data.pc1}\nPC2: ${data.pc2}`,
    );
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="pc1" name="PC1" />
        <YAxis type="number" dataKey="pc2" name="PC2" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter
          name="Tickers"
          data={convertedData}
          fill="#8884d8"
          onClick={(data) => handleClick(data)}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// TODO: Don't hardcode
const data = [
  {
    ticker_id: 9508,
    distance: 0.002247783698822674,
    original_pca_coordinates: [-0.8149930238723755, -0.5944980382919312],
    translated_pca_coordinates: [0.0004495382308959961, 0.00019443035125732422],
  },
  {
    ticker_id: 5790,
    distance: 0.002527149816009243,
    original_pca_coordinates: [-0.8151032328605652, -0.594702422618866],
    translated_pca_coordinates: [
      0.00033932924270629883, -0.000009953975677490234,
    ],
  },
  {
    ticker_id: 3477,
    distance: 0.002702983256080739,
    original_pca_coordinates: [-0.815053403377533, -0.5946152210235596],
    translated_pca_coordinates: [0.0003891587257385254, 0.00007724761962890625],
  },
  {
    ticker_id: 2838,
    distance: 0.0030825134245445873,
    original_pca_coordinates: [-0.8151386380195618, -0.5943780541419983],
    translated_pca_coordinates: [0.0003039240837097168, 0.00031441450119018555],
  },
  {
    ticker_id: 94363,
    distance: 0.0030903655788727144,
    original_pca_coordinates: [-0.8145533800125122, -0.5943667888641357],
    translated_pca_coordinates: [0.0008891820907592773, 0.0003256797790527344],
  },
  {
    ticker_id: 8322,
    distance: 0.0031436444749298425,
    original_pca_coordinates: [-0.815884530544281, -0.5949425101280212],
    translated_pca_coordinates: [
      -0.0004419684410095215, -0.00025004148483276367,
    ],
  },
  {
    ticker_id: 111022,
    distance: 0.0031500085302166936,
    original_pca_coordinates: [-0.8150834441184998, -0.5948421955108643],
    translated_pca_coordinates: [
      0.0003591179847717285, -0.00014972686767578125,
    ],
  },
  {
    ticker_id: 8774,
    distance: 0.0031567086530438736,
    original_pca_coordinates: [-0.8158383965492249, -0.5949271321296692],
    translated_pca_coordinates: [
      -0.00039583444595336914, -0.0002346634864807129,
    ],
  },
  {
    ticker_id: 11003,
    distance: 0.0032167184046077647,
    original_pca_coordinates: [-0.8150982856750488, -0.5945969820022583],
    translated_pca_coordinates: [
      0.00034427642822265625, 0.00009548664093017578,
    ],
  },
  {
    ticker_id: 3438,
    distance: 0.003342151474887957,
    original_pca_coordinates: [-0.8154605031013489, -0.594639778137207],
    translated_pca_coordinates: [
      -0.000017940998077392578, 0.00005269050598144531,
    ],
  },
  {
    ticker_id: 4185,
    distance: 0.003431580711526507,
    original_pca_coordinates: [-0.8149786591529846, -0.5944840312004089],
    translated_pca_coordinates: [
      0.00046390295028686523, 0.00020843744277954102,
    ],
  },
  {
    ticker_id: 5077,
    distance: 0.0035748320267770663,
    original_pca_coordinates: [-0.8156225681304932, -0.5948867201805115],
    translated_pca_coordinates: [
      -0.0001800060272216797, -0.00019425153732299805,
    ],
  },
  {
    ticker_id: 6995,
    distance: 0.0035944254413071536,
    original_pca_coordinates: [-0.8153555393218994, -0.5946207642555237],
    translated_pca_coordinates: [
      0.00008702278137207031, 0.00007170438766479492,
    ],
  },
  {
    ticker_id: 6948,
    distance: 0.003848380318863495,
    original_pca_coordinates: [-0.815136194229126, -0.5950257182121277],
    translated_pca_coordinates: [0.0003063678741455078, -0.000333249568939209],
  },
  {
    ticker_id: 3152,
    distance: 0.003857392478555977,
    original_pca_coordinates: [-0.8152487874031067, -0.5949926972389221],
    translated_pca_coordinates: [
      0.00019377470016479492, -0.0003002285957336426,
    ],
  },
  {
    ticker_id: 7152,
    distance: 0.003923400023902737,
    original_pca_coordinates: [-0.8153649568557739, -0.5948202610015869],
    translated_pca_coordinates: [0.0000776052474975586, -0.0001277923583984375],
  },
  {
    ticker_id: 7516,
    distance: 0.003943565062691682,
    original_pca_coordinates: [-0.8152959942817688, -0.5944774150848389],
    translated_pca_coordinates: [
      0.00014656782150268555, 0.00021505355834960938,
    ],
  },
  {
    ticker_id: 8276,
    distance: 0.003993208269844965,
    original_pca_coordinates: [-0.8159834742546082, -0.5948096513748169],
    translated_pca_coordinates: [
      -0.0005409121513366699, -0.00011718273162841797,
    ],
  },
  {
    ticker_id: 5217,
    distance: 0.0040027754562019895,
    original_pca_coordinates: [-0.8155215382575989, -0.5946354866027832],
    translated_pca_coordinates: [
      -0.00007897615432739258, 0.00005698204040527344,
    ],
  },
  {
    ticker_id: 7124,
    distance: 0.004037493318222306,
    original_pca_coordinates: [-0.8152492642402649, -0.5945408940315247],
    translated_pca_coordinates: [0.0001932978630065918, 0.00015157461166381836],
  },
];

const convertedData = data.map((item) => ({
  ticker_id: item.ticker_id,
  pc1: item.translated_pca_coordinates[0],
  pc2: item.translated_pca_coordinates[1],
}));
