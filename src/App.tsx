import React from "react";
import callWorkerFunction from "./utils/callWorkerFunction";

const App: React.FC = () => {
  return (
    <div>
      <h1>Hello, Vite + React + TypeScript!!!</h1>
    </div>
  );
};

export default App;

(() => {
  callWorkerFunction("count_etfs_per_exchange").then((data) => {
    console.log({ data });
  });

  // Call the function and log the result
  callWorkerFunction("get_etf_holder_asset_count", "SPY")
    .then((assetCount) =>
      console.log({
        assetCount,
      })
    )
    .catch((error) => console.error(error));

  callWorkerFunction("get_etf_holder_asset_count", "SPYG")
    .then((assetCount) =>
      console.log({
        assetCount,
      })
    )
    .catch((error) => console.error(error));

  callWorkerFunction("get_etf_holder_asset_names", "SPYG")
    .then((symbols) =>
      console.log({
        symbols,
      })
    )
    .catch((error) => console.error(error));

  callWorkerFunction("get_etf_holder_asset_names", "SPYG")
    .then((symbols) =>
      console.log({
        symbols,
      })
    )
    .catch((error) => console.error(error));
  callWorkerFunction("get_etf_holder_asset_names", "SPYG")
    .then((symbols) =>
      console.log({
        symbols,
      })
    )
    .catch((error) => console.error(error));
  callWorkerFunction("get_etf_holder_asset_names", "SPYG")
    .then((symbols) =>
      console.log({
        symbols,
      })
    )
    .catch((error) => console.error(error));
  callWorkerFunction("get_etf_holder_asset_names", "SPYG")
    .then((symbols) =>
      console.log({
        symbols,
      })
    )
    .catch((error) => console.error(error));

  setTimeout(() => {
    callWorkerFunction("get_etf_holder_asset_names", "SPYG")
      .then((symbols) =>
        console.log({
          symbols,
        })
      )
      .catch((error) => console.error(error));
  }, 5000);

  callWorkerFunction("get_symbols", "SPYG")
    .then((symbols) =>
      console.log({
        getSymbolsResult: symbols,
      })
    )
    .catch((error) => console.error(error));

  // callWorkerFunction("get_etf_holder", "TESTING123");
  // .then((url) =>
  //   console.log({
  //     etfHolder: url,
  //   })
  // )
  // .catch((error) => console.error(error));
})();
