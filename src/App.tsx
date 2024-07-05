import React from "react";
import callWorkerFunction from "./utils/callWorkerFunction";

export default function App() {
  return (
    <div>
      <h1>Hello, Rust + Vite + React + TypeScript!!!</h1>
    </div>
  );
}

(() => {
  callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
    console.log({ dataBuildInfo });
  });

  callWorkerFunction("get_symbols").then((symbols) => {
    console.log({ symbols });
  });

  callWorkerFunction("count_etfs_per_exchange")
    .then((countsPerExchange) =>
      console.log({
        countsPerExchange,
      })
    )
    .catch((error) => console.error(error));

  const ETF_HOLDER_SYMBOL = "SPY";
  callWorkerFunction("get_etf_holder_asset_count", ETF_HOLDER_SYMBOL)
    .then((assetCount) =>
      console.log({
        etfHolder: ETF_HOLDER_SYMBOL,
        assetCount,
      })
    )
    .catch((error) => console.error(error));
})();
