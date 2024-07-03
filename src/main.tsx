import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);

const callWorkerFunction = (() => {
  const worker = new Worker(new URL("./worker", import.meta.url), {
    type: "module",
  });

  let messageCounter = 0;
  const messagePromises = {};

  worker.onmessage = (event) => {
    const { messageId, success, result, error } = event.data;
    if (messageId in messagePromises) {
      const { resolve, reject } = messagePromises[messageId];
      if (success) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
      delete messagePromises[messageId];
    }
  };

  worker.onerror = (error) => {
    console.error("Worker error:", error);
    alert("An error occurred in the web worker");
  };

  const callWorkerFunction = (functionName, ...args) => {
    const messageId = messageCounter++;
    return new Promise((resolve, reject) => {
      messagePromises[messageId] = { resolve, reject };
      worker.postMessage({ functionName, args, messageId });
    });
  };

  return callWorkerFunction;
})();

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
