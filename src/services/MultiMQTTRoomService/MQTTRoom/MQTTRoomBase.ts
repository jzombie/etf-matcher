import { Buffer } from "buffer";
import EventEmitter from "events";

import customLogger from "@utils/customLogger";

import validateTopic from "../validateTopic";
import { EnvelopeType, PostMessageStructKey } from "./MQTTRoom.sharedBindings";
import { MQTTRoomEvents, SendOptions } from "./MQTTRoom.sharedBindings";

type MessagePromise<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

// TODO: Extend `DisposableEmitter` instead?
/**
 * `MQTTRoomBase` is an abstract class that manages MQTT room connections.
 * It uses a worker thread to handle asynchronous MQTT operations and
 * facilitates communication between the worker and room instances.
 *
 * This is intended to be extended by `MQTTRoom`.
 */
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

  // Note: `any` is used in this declaration because the type is set dynamically and
  // `unknown` is problematic to work with in this context.
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _messagePromisesMap = new Map<number, MessagePromise<any>>();

  private static _roomMap: Map<MQTTRoomBase["_peerId"], MQTTRoomBase> =
    new Map();

  private _peerId!: string;
  private _isConnecting: boolean = false;
  private _isConnected: boolean = false;

  private _isClosing: boolean = false;

  private _brokerURL!: string;
  private _roomName!: string;

  private _peers: string[] = [];

  private _isInSync: boolean = false;
  private _operationStack: string[] = [];

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

    try {
      const peerId = await MQTTRoomBase._callMQTTRoomWorker<string>(
        "connect-room",
        [this._brokerURL, this._roomName],
      );

      this._setConnectingState(false); // `ing`
      this._setConnectionState(true); // `ion`

      this._peerId = peerId;

      // Register with room map
      MQTTRoomBase._roomMap.set(this._peerId, this);
      this.once("close", () => MQTTRoomBase._roomMap.delete(this._peerId));

      this.emit("connect");
    } catch (err) {
      this.emit("error", err as Error);

      this.close(err as Error);
    }
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
      // If the data is a Buffer, serialize it using the toJSON() method.
      // The toJSON() method returns an object with the following structure:
      // {
      //   type: 'Buffer',  // This indicates that the object represents a serialized Buffer.
      //   data: [ ... ]    // This is an array of the buffer's bytes.
      // }
      // This serialized format is efficient for transferring the buffer data
      // across threads or processes, such as to a worker.
      data = data.toJSON();
    }

    try {
      await MQTTRoomBase._callMQTTRoomWorker("send", [
        this._peerId,
        data,
        options,
      ]);
    } finally {
      this._popStateOperation("send");
    }
  }

  private static async _callMQTTRoomWorker<T>(
    functionName: string,
    args: unknown[] = [],
    abortSignal?: AbortSignal,
  ): Promise<T> {
    const messageId = MQTTRoomBase._messageCounter++;

    return new Promise<T>((resolve, reject) => {
      // Set the promise in the map with the correct type
      MQTTRoomBase._messagePromisesMap.set(messageId, {
        resolve,
        reject,
      } as MessagePromise<T>);

      MQTTRoomBase._worker.postMessage({ functionName, args, messageId });

      const handleAbort = () => {
        cleanup();
        // Note: As of now the worker & Rust service do not yet support
        // this action, but it should be safely ignored
        MQTTRoomBase._worker.postMessage({ messageId, action: "abort" });
        reject(new Error("Aborted"));

        // Delete message promise
        MQTTRoomBase._messagePromisesMap.delete(messageId);
      };

      if (abortSignal) {
        abortSignal.addEventListener("abort", handleAbort);
      }

      const cleanup = () => {
        if (abortSignal) {
          abortSignal.removeEventListener("abort", handleAbort);
        }
      };

      const wrappedResolve = (value: T | PromiseLike<T>) => {
        cleanup();
        resolve(value);

        // Delete message promise
        MQTTRoomBase._messagePromisesMap.delete(messageId);
      };

      const wrappedReject = (reason?: unknown) => {
        cleanup();
        reject(reason);

        // Delete message promise
        MQTTRoomBase._messagePromisesMap.delete(messageId);
      };

      // Update the map with wrapped resolve and reject
      MQTTRoomBase._messagePromisesMap.set(messageId, {
        resolve: wrappedResolve,
        reject: wrappedReject,
      } as MessagePromise<T>);
    });
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
      if (MQTTRoomBase._messagePromisesMap.has(messageId)) {
        const { resolve, reject } =
          MQTTRoomBase._messagePromisesMap.get(messageId)!;
        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
        MQTTRoomBase._messagePromisesMap.delete(messageId);
      }
    } else if (envelopeType === EnvelopeType.Event) {
      const room = MQTTRoomBase._roomMap.get(peerId);

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

        if (eventName === "close") {
          room.close("Worker close event");
        } else {
          // This emits the event directly on the room instance
          room.emit(eventName, eventData);
        }
      } else {
        customLogger.warn("Received message for non-existent room", event.data);
      }
    }
  }

  async close(reason?: unknown) {
    // Prevent double closing
    if (this._isClosing) {
      return;
    }

    this._isClosing = true;

    if (reason) {
      customLogger.debug("Proceeding to close due to reason:", reason);
    }

    this._peers = [];

    this._setConnectingState(false); // `ing`
    this._setConnectionState(false); // `ion`

    try {
      if (this._peerId) {
        await MQTTRoomBase._callMQTTRoomWorker("close", [this._peerId]);
      }
    } catch (err) {
      customLogger.error(
        "Error closing room in worker",
        err instanceof Error ? err.message : err,
      );
    }

    this.emit("close");

    this.removeAllListeners();
  }

  get peerId() {
    return this._peerId;
  }

  get peers() {
    return this._peers;
  }

  get isInSync() {
    return this._isInSync;
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
}
