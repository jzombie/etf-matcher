// Inspect with:
// chrome://inspect/#workers

import customLogger from "./customLogger";

// eslint-disable-next-line no-undef
const workerSelf = self as unknown as SharedWorkerGlobalScope;

const connections: MessagePort[] = [];

workerSelf.onconnect = (event: MessageEvent) => {
  // Not really a warn, but keeping this for now
  customLogger.warn("Hello from SharedWorker");

  const port = event.ports[0];
  connections.push(port);

  port.onmessage = (event: MessageEvent) => {
    // Broadcast the message to all connected ports
    connections.forEach((conn) => {
      if (conn !== port) {
        conn.postMessage(event.data);
      }
    });
  };

  port.start();
};
