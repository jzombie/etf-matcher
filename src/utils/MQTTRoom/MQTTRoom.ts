import { Buffer } from "buffer";
import EventEmitter from "events";

import { EnvelopeType, PostMessageStructKey } from "./MQTTRoom.sharedBindings";

const worker = new Worker(new URL("./MQTTRoom.worker", import.meta.url), {
  type: "module",
});

// TODO: Use as a static property
const roomMap = new Map<MQTTRoom["peerId"], MQTTRoom>();

export default class MQTTRoom extends EventEmitter {
  protected _peerId!: string;
  protected _brokerURL: string;
  protected _roomName: string;
  protected _isConnected: boolean = false;

  constructor(brokerURL: string, roomName: string) {
    super();

    this._brokerURL = brokerURL;
    this._roomName = roomName;

    // TODO: Enable this
    // worker.postMessage();

    this._connect();
  }

  protected async _connect() {
    console.log("before connect");

    const peerId = await callMQTTRoomWorker<string>("connect-room", [
      this._brokerURL,
      this._roomName,
    ]);

    this._peerId = peerId;

    // Register with room map
    roomMap.set(this.peerId, this);
    this.once("close", () => roomMap.delete(this.peerId));

    console.log("after connect");

    this._isConnected = true;
    this.emit("connect");

    console.log("connected...", this.peerId);

    // worker.postMessage({
    //   action: "connect",
    //   roomName: this._roomName,
    // });
  }

  // TODO: Add optional `qos`?
  async send(data: string | Buffer | object) {
    await callMQTTRoomWorker("send", [this.peerId, data]);
  }

  get peerId() {
    return this._peerId;
  }

  get isConnected() {
    return this._isConnected;
  }

  close() {
    this.emit("close");

    this.removeAllListeners();
  }
}

let messageCounter = 0;
const messagePromises: {
  [key: string]: {
    resolve: CallableFunction;
    reject: CallableFunction;
  };
} = {};

worker.onmessage = (event) => {
  const {
    [PostMessageStructKey.MessageId]: messageId,
    [PostMessageStructKey.Success]: success,
    [PostMessageStructKey.Result]: result,
    [PostMessageStructKey.Error]: error,
    [PostMessageStructKey.EnvelopeType]: envelopeType,
    [PostMessageStructKey.EventName]: eventName,
    [PostMessageStructKey.EventData]: eventData,
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
    const room = roomMap.get(peerId);
    if (room) {
      room.emit(eventName, eventData);
    }
  }
};

const callMQTTRoomWorker = <T>(
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
