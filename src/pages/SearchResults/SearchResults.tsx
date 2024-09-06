import React from "react";

import WindowManager from "@components/WindowManager";

export default function SearchResults() {
  return (
    <WindowManager
      initialValue={{
        direction: "column",
        first: "Detail",
        second: {
          direction: "row",
          first: "Historical Prices",
          second: "Similarity Search",
        },
        splitPercentage: 40,
      }}
    />
  );
}
