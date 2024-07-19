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
  alert(
    `This application is likely not supported on your current browser version or device. If you are on iOS, version 15 may be the minimum that is supported.`
  );
};

const callWorkerFunction = <T>(
  functionName: string,
  args: unknown[] = []
): Promise<T> => {
  const messageId = messageCounter++;
  return new Promise((resolve, reject) => {
    messagePromises[messageId] = { resolve, reject };
    worker.postMessage({ functionName, args, messageId });
  });
};

export default callWorkerFunction;
