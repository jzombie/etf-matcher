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
  alert("An error occurred in the web worker");
};

const callWorkerFunction = (functionName: string, ...args: unknown[]) => {
  const messageId = messageCounter++;
  return new Promise((resolve, reject) => {
    messagePromises[messageId] = { resolve, reject };
    worker.postMessage({ functionName, args, messageId });
  });
};

export default callWorkerFunction;
