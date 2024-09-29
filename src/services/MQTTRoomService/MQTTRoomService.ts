import { Buffer } from "buffer";

import MQTTRoom from "./MQTTRoom";
import { EnvelopeType, PostMessageStructKey } from "./MQTTRoom.sharedBindings";

const worker = new Worker(new URL("./MQTTRoom.worker", import.meta.url), {
  type: "module",
});

export default abstract class MQTTRoomService {
  static messageCounter = 0;
  static messagePromises: {
    [key: string]: {
      resolve: CallableFunction;
      reject: CallableFunction;
    };
  } = {};

  public static async callMQTTRoomWorker<T>(
    functionName: string,
    args: unknown[] = [],
    abortSignal?: AbortSignal,
  ): Promise<T> {
    const messageId = this.messageCounter++;

    return new Promise<T>((resolve, reject) => {
      this.messagePromises[messageId] = { resolve, reject };

      worker.postMessage({ functionName, args, messageId });

      const handleAbort = () => {
        // Note: As of now the worker & Rust service do not yet support
        // this action, but it should be safely ignored
        worker.postMessage({ messageId, action: "abort" });
        reject(new Error("Aborted"));
        delete this.messagePromises[messageId];
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
      this.messagePromises[messageId] = {
        resolve: wrappedResolve,
        reject: wrappedReject,
      };
    });
  }

  public static async handleWorkerMessage(event: MessageEvent) {
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
      if (messageId in this.messagePromises) {
        const { resolve, reject } = this.messagePromises[messageId];
        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
        delete this.messagePromises[messageId];
      }
    } else if (envelopeType === EnvelopeType.Event) {
      const room = MQTTRoom.roomMap.get(peerId);
      if (room) {
        let { [PostMessageStructKey.EventData]: eventData } = event.data;

        if (eventName === "peersupdate") {
          room.onPeersUpdated(eventData);
        }

        // Deserialize Buffer if necessary
        if (
          eventData &&
          eventData.type === "Buffer" &&
          Array.isArray(eventData.data)
        ) {
          eventData = Buffer.from(eventData.data);
        }

        room.emit(eventName, eventData);
      }
    }
  }
}

worker.onmessage = (event: MessageEvent) =>
  MQTTRoomService.handleWorkerMessage(event);
