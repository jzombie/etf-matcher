import init, * as wasmModule from "./pkg/hello_wasm.js";

/**
 * This Web Worker script acts as a simple proxy layer to offload WebAssembly (WASM)
 * execution from the main thread. It listens for messages containing function names
 * and arguments, dynamically executes the corresponding functions from the WASM
 * module, and sends the results back to the main thread.
 */
self.onmessage = async (event) => {
  const { functionName, args } = event.data;
  console.log(
    "Worker received message with functionName:",
    functionName,
    "and args:",
    args
  );

  if (typeof wasmModule[functionName] !== "function") {
    console.error("Unknown function:", functionName);
    self.postMessage({
      success: false,
      error: `Unknown function: ${functionName}`,
    });
    return;
  }

  try {
    await init();
    const result = await wasmModule[functionName](...args);
    console.log(
      "Worker successfully executed function:",
      functionName,
      "with result:",
      result
    );
    self.postMessage({ success: true, result: result });
  } catch (error) {
    console.error("Worker encountered an error:", error);
    self.postMessage({ success: false, error: error.message });
  }
};
