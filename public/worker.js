import init, * as wasmModule from "./pkg/hello_wasm.js";

let initialized = false;
let initPromise = null;
let callQueue = [];

/**
 * This function ensures the WebAssembly module is initialized only once.
 */
async function initializeWasm() {
  if (!initialized) {
    if (!initPromise) {
      initPromise = init();
      await initPromise;
      initialized = true;
    } else {
      await initPromise;
    }
  }
}

/**
 * This function processes the call queue.
 */
async function processQueue() {
  while (callQueue.length > 0) {
    const { functionName, args, resolve, reject } = callQueue.shift();

    try {
      await initializeWasm();
      if (typeof wasmModule[functionName] !== "function") {
        throw new Error(`Unknown function: ${functionName}`);
      }
      const result = await wasmModule[functionName](...args);
      resolve(result);
    } catch (error) {
      console.error("Worker encountered an error:", error);
      reject(error);
    }
  }
}

/**
 * This Web Worker script acts as a simple proxy layer to offload WebAssembly (WASM)
 * execution from the main thread. It listens for messages containing function names
 * and arguments, dynamically executes the corresponding functions from the WASM
 * module, and sends the results back to the main thread.
 */
self.onmessage = async (event) => {
  const { functionName, args, messageId } = event.data;
  console.log(
    "Worker received message with functionName:",
    functionName,
    "and args:",
    args
  );

  const promise = new Promise((resolve, reject) => {
    callQueue.push({ functionName, args, resolve, reject });
    if (callQueue.length === 1) {
      processQueue();
    }
  });

  promise
    .then((result) => {
      self.postMessage({ success: true, result, messageId });
    })
    .catch((error) => {
      self.postMessage({ success: false, error: error.message, messageId });
    });
};
