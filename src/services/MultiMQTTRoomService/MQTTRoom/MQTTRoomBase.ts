import { Buffer } from "buffer";
import EventEmitter from "events";

import validateTopic from "../validateTopic";
import { EnvelopeType, PostMessageStructKey } from "./MQTTRoom.sharedBindings";
import { MQTTRoomEvents, SendOptions } from "./MQTTRoom.sharedBindings";

// TODO: Extend `DisposableEmitter` instead?
export default abstract class MQTTRoomBase extends EventEmitter<MQTTRoomEvents> {
  private static _worker = (() => {
    const worker = new Worker(new URL("./MQTTRoom.worker", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent) =>
      MQTTRoomBase._handleWorkerMessage(event);

    return worker;
  })();

  private static _messageCounter = 0;
  private static _messagePromises: {
    [key: string]: {
      resolve: CallableFunction;
      reject: CallableFunction;
    };
  } = {};

  private static _roomMap: Map<MQTTRoomBase["peerId"], MQTTRoomBase> =
    new Map();

  protected _peerId!: string;
  protected _isConnecting: boolean = false;
  protected _isConnected: boolean = false;

  protected _brokerURL!: string;
  protected _roomName!: string;

  protected _peers: string[] = [];

  protected _isInSync: boolean = false;
  protected _operationStack: string[] = [];

  get peerId() {
    return this._peerId;
  }

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
  }

  protected async _connect() {
    this._setConnectingState(true);

    const peerId = await MQTTRoomBase._callMQTTRoomWorker<string>(
      "connect-room",
      [this._brokerURL, this._roomName],
    );

    this._setConnectingState(false); // `ing`
    this._setConnectionState(true); // `ion`

    this._peerId = peerId;

    // Register with room map
    MQTTRoomBase._roomMap.set(this.peerId, this);
    this.once("close", () => MQTTRoomBase._roomMap.delete(this.peerId));

    this._isConnected = true;
    this.emit("connect");
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

  onPeersUpdated(peers: string[]) {
    this._peers = peers;
  }

  protected _setConnectingState(isConnecting: boolean) {
    this._isConnecting = isConnecting;
    this.emit("connectingstateupdate", isConnecting);
  }

  protected _setConnectionState(isConnected: boolean) {
    this._isConnected = isConnected;
    this.emit("connectionstateupdate", isConnected);
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
      await MQTTRoomBase._callMQTTRoomWorker("send", [
        this.peerId,
        data,
        options,
      ]);
    } finally {
      this._popStateOperation("send");
    }
  }

  private static async _handleWorkerMessage(event: MessageEvent) {
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
      if (messageId in MQTTRoomBase._messagePromises) {
        const { resolve, reject } = MQTTRoomBase._messagePromises[messageId];
        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
        delete MQTTRoomBase._messagePromises[messageId];
      }
    } else if (envelopeType === EnvelopeType.Event) {
      const room = this._roomMap.get(peerId);
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

  private static async _callMQTTRoomWorker<T>(
    functionName: string,
    args: unknown[] = [],
    abortSignal?: AbortSignal,
  ): Promise<T> {
    const messageId = MQTTRoomBase._messageCounter++;

    return new Promise<T>((resolve, reject) => {
      MQTTRoomBase._messagePromises[messageId] = { resolve, reject };

      MQTTRoomBase._worker.postMessage({ functionName, args, messageId });

      const handleAbort = () => {
        cleanup();
        // Note: As of now the worker & Rust service do not yet support
        // this action, but it should be safely ignored
        MQTTRoomBase._worker.postMessage({ messageId, action: "abort" });
        reject(new Error("Aborted"));
        delete MQTTRoomBase._messagePromises[messageId];
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

      MQTTRoomBase._messagePromises[messageId] = {
        resolve: wrappedResolve,
        reject: wrappedReject,
      };
    });
  }

  async close() {
    this._peers = [];
    this._setConnectionState(false);

    await MQTTRoomBase._callMQTTRoomWorker("close", [this.peerId]);

    // Note: The `close` event is handled interally via `handleWorkerMessage`

    this.removeAllListeners();
  }
}
