import customLogger from "@utils/customLogger";

import {
  EnvelopeType,
  NotifierEvent,
  PostMessageStructKey,
} from "./workerMainBindings";

const worker = new Worker(new URL("./worker", import.meta.url), {
  type: "module",
});

let messageCounter = 0;
const messagePromises: {
  [key: string]: {
    resolve: CallableFunction;
    reject: CallableFunction;
  };
} = {};

const [subscribe, invokeHooks] = (() => {
  const subscribers: ((eventType: NotifierEvent, args: unknown[]) => void)[] =
    [];

  const subscribe = (
    callback: (eventType: NotifierEvent, args: unknown[]) => void,
  ) => {
    subscribers.push(callback);

    // Return the unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  };

  const invokeHooks = (eventType: NotifierEvent, args: unknown[]) => {
    subscribers.forEach((hook) => hook(eventType, args));
  };

  return [subscribe, invokeHooks];
})();

export { subscribe, invokeHooks };

worker.onmessage = (event) => {
  const {
    [PostMessageStructKey.MessageId]: messageId,
    [PostMessageStructKey.Success]: success,
    [PostMessageStructKey.Result]: result,
    [PostMessageStructKey.Error]: error,
    [PostMessageStructKey.EnvelopeType]: envelopeType,
    [PostMessageStructKey.NotifierEventType]: notifierEventType,
    [PostMessageStructKey.NotifierArgs]: notifierArgs,
  } = event.data;

  if (envelopeType === EnvelopeType.Function) {
    if (messageId in messagePromises) {
      const { resolve, reject } = messagePromises[messageId];
      if (success) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
      delete messagePromises[messageId];
    }
  } else if (envelopeType === EnvelopeType.NotifiyEvent) {
    invokeHooks(notifierEventType, notifierArgs);
  }
};

worker.onerror = (error) => {
  customLogger.error("Worker error:", error);
  alert(
    `This application is likely not supported on your current browser version or device. If you are on iOS, version 15 may be the minimum that is supported.`,
  );
};

const callRustService = <T>(
  functionName: string,
  args: unknown[] = [],
  abortSignal?: AbortSignal,
): Promise<T> => {
  const messageId = messageCounter++;

  return new Promise<T>((resolve, reject) => {
    messagePromises[messageId] = { resolve, reject };

    worker.postMessage({ functionName, args, messageId });

    const handleAbort = () => {
      // Note: As of now the worker & Rust service do not yet support
      // this action, but it should be safely ignored
      worker.postMessage({ messageId, action: "abort" });
      reject(new Error("Aborted"));
      delete messagePromises[messageId];
    };

    if (abortSignal) {
      abortSignal.addEventListener("abort", handleAbort);
    }

    // Cleanup function to remove the abort event listener
    const cleanup = () => {
      if (abortSignal) {
        abortSignal.removeEventListener("abort", handleAbort);
      }
    };

    // Handle resolving and rejecting to ensure cleanup is called
    const wrappedResolve = (value: T) => {
      cleanup();
      resolve(value);
    };

    const wrappedReject = (reason?: unknown) => {
      cleanup();
      reject(reason);
    };

    // Replace the original promise handlers with the wrapped ones
    messagePromises[messageId] = {
      resolve: wrappedResolve,
      reject: wrappedReject,
    };
  });
};

export default callRustService;
