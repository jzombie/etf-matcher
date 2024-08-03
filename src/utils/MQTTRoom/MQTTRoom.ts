import { Buffer } from "buffer";
import EventEmitter from "events";

import {
  EnvelopeType,
  MQTTRoomEvents,
  PostMessageStructKey,
  SendOptions,
} from "./MQTTRoom.sharedBindings";
import validateTopic from "./validateTopic";

const worker = new Worker(new URL("./MQTTRoom.worker", import.meta.url), {
  type: "module",
});

export default class MQTTRoom extends EventEmitter<MQTTRoomEvents> {
  public static roomMap: Map<MQTTRoom["peerId"], MQTTRoom> = new Map();

  protected _peerId!: string;
  protected _peers: string[] = [];
  protected _brokerURL: string;
  protected _roomName: string;
  protected _isConnecting: boolean = false;
  protected _isConnected: boolean = false;
  protected _isInSync: boolean = false;
  protected _operationStack: string[] = [];

  constructor(brokerURL: string, roomName: string) {
    super();

    if (!validateTopic(roomName)) {
      throw new Error("Invalid room name");
    }

    this._brokerURL = brokerURL;
    this._roomName = roomName;

    this.on("message", () => {
      if (!this._operationStack.length && !this._isInSync) {
        this._setSyncState(true);
      }
    });

    this.on("disconnect", () => {
      this._setConnectionState(false);
    });

    // Note: `queueMicrotask` is not sufficient here for letting React be aware
    // of the `connecting state` prior to connect
    setTimeout(() => {
      this._connect();
    });
  }

  protected async _connect() {
    this._setConnectingState(true);

    const peerId = await callMQTTRoomWorker<string>("connect-room", [
      this._brokerURL,
      this._roomName,
    ]);

    this._setConnectingState(false); // `ing`
    this._setConnectionState(true); // `ion`

    this._peerId = peerId;

    // Register with room map
    MQTTRoom.roomMap.set(this.peerId, this);
    this.once("close", () => MQTTRoom.roomMap.delete(this.peerId));

    this._isConnected = true;
    this.emit("connect");
  }

  protected _setConnectingState(isConnecting: boolean) {
    this._isConnecting = isConnecting;
    this.emit("connectingstateupdate", isConnecting);
  }

  protected _setConnectionState(isConnected: boolean) {
    this._isConnected = isConnected;
    this.emit("connectionstateupdate", isConnected);
  }

  protected _setSyncState(isInSync: boolean) {
    this._isInSync = isInSync;
    this.emit("syncupdate", isInSync);
  }

  protected _pushStateOperation(operation: string) {
    this._operationStack.push(operation);
    this._setSyncState(false);
  }

  protected _popStateOperation(operation: string) {
    const index = this._operationStack.indexOf(operation);
    if (index > -1) {
      this._operationStack.splice(index, 1);
    }
    if (this._operationStack.length === 0) {
      this._setSyncState(true);
    }
  }

  async send(data: string | Buffer | object, options?: SendOptions) {
    this._pushStateOperation("send");

    if (Buffer.isBuffer(data)) {
      data = {
        type: "Buffer",
        data: Array.from(data),
      };
    }

    try {
      await callMQTTRoomWorker("send", [this.peerId, data, options]);
    } finally {
      this._popStateOperation("send");
    }
  }

  get isInSync() {
    return this._isInSync;
  }

  get peerId() {
    return this._peerId;
  }

  get roomName() {
    return this._roomName;
  }

  get isConnecting() {
    return this._isConnecting;
  }

  get isConnected() {
    return this._isConnected;
  }

  onPeersUpdated(peers: string[]) {
    this._peers = peers;
  }

  get peers() {
    return this._peers;
  }

  close() {
    this._peers = [];
    this._setConnectionState(false);

    callMQTTRoomWorker("close", [this.peerId]);
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
