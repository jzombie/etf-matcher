// Inspect with:
// chrome://inspect/#workers

// eslint-disable-next-line no-undef
const workerSelf = self as unknown as SharedWorkerGlobalScope;

const connections: MessagePort[] = [];

workerSelf.onconnect = (event: MessageEvent) => {
  console.log("Hello from SharedWorker");

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
