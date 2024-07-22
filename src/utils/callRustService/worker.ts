import init, * as wasmModule from "../../../public/pkg/etf_matcher";
import customLogger from "../customLogger";
import {
  EnvelopeType,
  PostMessageStructKey,
  NotifierEvent,
} from "./workerMainBindings";

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
        customLogger.error(
          `Worker encountered an error @ function "${functionName}" [${args.join(
            ","
          )}]:`,
          error
        );
        reject(error);
      }
    }
  }
}

self.onmessage = async (event) => {
  const { functionName, args, messageId } = event.data;
  // customLogger.debug(
  //   "Worker received message with functionName:",
  //   functionName,
  //   "and args:",
  //   args
  // );

  const promise = new Promise((resolve, reject) => {
    callQueue.push({ functionName, args, resolve, reject });
    if (callQueue.length === 1) {
      processQueue();
    }
  });

  promise
    .then((result) => {
      self.postMessage({
        [PostMessageStructKey.EnvelopeType]: EnvelopeType.Function,
        [PostMessageStructKey.Success]: true,
        [PostMessageStructKey.Result]: result,
        [PostMessageStructKey.MessageId]: messageId,
      });
    })
    .catch((error) => {
      self.postMessage({
        [PostMessageStructKey.EnvelopeType]: EnvelopeType.Function,
        [PostMessageStructKey.Success]: false,
        [PostMessageStructKey.Error]: error.message,
        [PostMessageStructKey.MessageId]: messageId,
      });
    });
};

// Invoked from Rust
(
  self as unknown as {
    rustNotifyCallback: (eventType: NotifierEvent, args: unknown[]) => void;
  }
).rustNotifyCallback = function (eventType: NotifierEvent, args: unknown[]) {
  self.postMessage({
    [PostMessageStructKey.EnvelopeType]: EnvelopeType.NotifiyEvent,
    [PostMessageStructKey.NotifierEventType]: eventType,
    [PostMessageStructKey.NotifierArgs]: args,
  });
};
