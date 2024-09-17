import init, * as wasmModule from "../../../public/pkg/etf_matcher";
import customLogger from "../customLogger";
import {
  EnvelopeType,
  NotifierEvent,
  PostMessageStructKey,
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

// const IS_PROD = import.meta.env.PROD;

// Used to help prevent console spam for long args
function truncateArg(arg: unknown, maxLength = 50) {
  // FIXME: Ignore in prod?
  // if (IS_PROD) {
  //   return arg;
  // }

  const truncationSuffix = "... (truncated)";

  // If the argument is a string, truncate it if it's too long
  if (typeof arg === "string") {
    return arg.length > maxLength
      ? `${arg.slice(0, maxLength)}${truncationSuffix}`
      : arg;
  }

  // If it's an array or object, JSON.stringify it and then truncate
  if (typeof arg === "object") {
    try {
      const argString = JSON.stringify(arg);
      return argString.length > maxLength
        ? `${argString.slice(0, maxLength)}${truncationSuffix}`
        : argString;
    } catch (e) {
      return "[Unserializable Object]";
    }
  }

  // Otherwise, return the argument as is
  return arg;
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
        // Argument truncation is extremely useful if the args could be long strings
        const truncatedArgs = args.map((arg) => truncateArg(arg));
        customLogger.error(
          `Worker encountered an error @ function "${functionName}" [${truncatedArgs.join(
            ", ",
          )}]:`,
          error,
        );
        reject(error);
      }
    }
  }
}

self.onmessage = async (event) => {
  const { functionName, args, messageId } = event.data;

  // FIXME: If enabled, use log truncation?
  // customLogger.debug(
  //   "Worker received message with functionName:",
  //   functionName,
  //   "and args:",
  //   args,
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
