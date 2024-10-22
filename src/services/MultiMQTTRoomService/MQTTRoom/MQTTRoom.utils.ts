import { Buffer } from "buffer";

import MQTTRoom from "./MQTTRoom";
import { EnvelopeType, PostMessageStructKey } from "./MQTTRoom.sharedBindings";

const worker = new Worker(new URL("./MQTTRoom.worker", import.meta.url), {
  type: "module",
});

let messageCounter = 0;
const messagePromises: {
  [key: string]: {
    resolve: CallableFunction;
    reject: CallableFunction;
  };
} = {};

export async function callMQTTRoomWorker<T>(
  functionName: string,
  args: unknown[] = [],
  abortSignal?: AbortSignal,
): Promise<T> {
  const messageId = messageCounter++;

  return new Promise<T>((resolve, reject) => {
    messagePromises[messageId] = { resolve, reject };

    worker.postMessage({ functionName, args, messageId });

    const handleAbort = () => {
      cleanup();
      // Note: As of now the worker & Rust service do not yet support
      // this action, but it should be safely ignored
      worker.postMessage({ messageId, action: "abort" });
      reject(new Error("Aborted"));
      delete messagePromises[messageId];
    };

    if (abortSignal) {
      abortSignal.addEventListener("abort", handleAbort);
    }

    const cleanup = () => {
      if (abortSignal) {
        abortSignal.removeEventListener("abort", handleAbort);
      }
    };

    const wrappedResolve = (value: T) => {
      cleanup();
      resolve(value);
    };

    const wrappedReject = (reason?: unknown) => {
      cleanup();
      reject(reason);
    };

    messagePromises[messageId] = {
      resolve: wrappedResolve,
      reject: wrappedReject,
    };
  });
}

async function handleWorkerMessage(event: MessageEvent) {
  const {
    [PostMessageStructKey.MessageId]: messageId,
    [PostMessageStructKey.Success]: success,
    [PostMessageStructKey.Result]: result,
    [PostMessageStructKey.Error]: error,
    [PostMessageStructKey.EnvelopeType]: envelopeType,
    [PostMessageStructKey.EventName]: eventName,
    [PostMessageStructKey.PeerId]: peerId,
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
  } else if (envelopeType === EnvelopeType.Event) {
    const room = MQTTRoom.roomMap.get(peerId);
    if (room) {
      let { [PostMessageStructKey.EventData]: eventData } = event.data;

      if (eventName === "peersupdate") {
        room.onPeersUpdated(eventData);
      }

      if (
        eventData &&
        eventData.type === "Buffer" &&
        Array.isArray(eventData.data)
      ) {
        eventData = Buffer.from(eventData.data);
      }

      // This emits the event directly on the room instance
      room.emit(eventName, eventData);
    }
  }
}

worker.onmessage = (event: MessageEvent) => handleWorkerMessage(event);
