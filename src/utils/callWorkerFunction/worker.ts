import init, * as wasmModule from "../../../public/pkg/hello_wasm";

interface CallQueueItem {
  functionName: string;
  args: unknown[];
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let initialized = false;
let initPromise: Promise<void> | null = null;
const callQueue: CallQueueItem[] = [];

async function initializeWasm() {
  if (!initialized) {
    if (!initPromise) {
      initPromise = init().then(() => {
        initialized = true;
      });
      await initPromise;
    } else {
      await initPromise;
    }
  }
}

async function processQueue() {
  while (callQueue.length > 0) {
    const queueItem = callQueue.shift();

    if (queueItem) {
      const { functionName, args, resolve, reject } = queueItem;

      try {
        await initializeWasm();
        if (
          typeof (wasmModule as { [key: string]: unknown })[functionName] !==
          "function"
        ) {
          throw new Error(`Unknown function: ${functionName}`);
        }
        const result = await (
          wasmModule as { [key: string]: CallableFunction }
        )[functionName](...args);
        resolve(result);
      } catch (error) {
        console.error(
          `Worker encountered an error @ function "${functionName}":`,
          error
        );
        reject(error);
      }
    }
  }
}

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
