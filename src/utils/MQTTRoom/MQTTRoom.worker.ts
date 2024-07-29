import { Buffer } from "buffer";
import EventEmitter from "events";
import mqtt from "mqtt";
import { v4 as uuidv4 } from "uuid";

import { EnvelopeType, PostMessageStructKey } from "./MQTTRoom.sharedBindings";

// TODO: Use as a static property in the worker
const roomWorkerMap = new Map<MQTTRoomWorker["peerId"], MQTTRoomWorker>();

enum PresenceStatus {
  JOIN = "join",
  HERE = "here",
  CHECKIN = "checkin",
  LEAVE = "leave",
}

type Presence = {
  peerId: string;
  status: PresenceStatus;
};

export default class MQTTRoomWorker extends EventEmitter {
  protected _mqttClient: mqtt.MqttClient;

  public readonly brokerURL: string;
  public readonly roomName: string;
  public readonly peerId: string;

  public readonly peers: Set<string> = new Set();

  protected _topicMessages: string;
  protected _topicPresence: string;

  protected _encodeBuffer<T extends string | Buffer | object>(data: T): Buffer {
    let buffer: Buffer;
    if (Buffer.isBuffer(data)) {
      buffer = Buffer.concat([Buffer.from([0]), data]);
    } else if (typeof data === "string") {
      buffer = Buffer.concat([Buffer.from([1]), Buffer.from(data)]);
    } else {
      buffer = Buffer.concat([
        Buffer.from([2]),
        Buffer.from(JSON.stringify(data)),
      ]);
    }

    return buffer;
  }

  protected _emitLocalHostEvent(eventName: string, eventData?: unknown) {
    self.postMessage({
      [PostMessageStructKey.PeerId]: this.peerId,
      [PostMessageStructKey.EnvelopeType]: EnvelopeType.Event,
      [PostMessageStructKey.EventName]: eventName,
      [PostMessageStructKey.EventData]: eventData,
    });
  }

  protected _decodeBuffer<T extends string | Buffer | object>(
    buffer: Buffer,
  ): T {
    let data: Buffer | string;

    // First byte indicates the data type
    if (buffer[0] === 0) {
      // 0 indicates buffer type
      data = buffer.subarray(1);
    } else if (buffer[0] === 1) {
      // 1 indicates string type
      data = buffer.subarray(1).toString("utf-8");
    } else if (buffer[0] === 2) {
      // 2 indicates object, or other, type
      data = JSON.parse(buffer.subarray(1).toString());
    } else {
      // This could be the case that another client has left a message (possibly
      // a retained message) that doesn't match this schema.
      throw new Error(
        `Could not determine _decodeBuffer type from code: ${buffer[0]}`,
      );
    }

    return data as T;
  }

  constructor(brokerURL: string, roomName: string) {
    super();

    this.peerId = uuidv4();
    this.brokerURL = brokerURL;
    this.roomName = roomName;

    this._topicMessages = `${this.roomName}/messages`;
    this._topicPresence = `${this.roomName}/presence`;

    roomWorkerMap.set(this.peerId, this);
    this.once("close", () => roomWorkerMap.delete(this.peerId));

    this._mqttClient = mqtt.connect(brokerURL, {
      // Known as "LWT" or (Last Will & Testament)
      // In MQTT, the Last Will and Testament (LWT) is a message that is specified at the time of connection.
      // It allows clients to notify other clients about an ungraceful disconnection.
      // If a client disconnects unexpectedly, the broker will publish the LWT message to a specified topic.
      // This feature is particularly useful for ensuring reliable communication and detecting failures in an IoT environment.
      // The LWT message includes the topic, payload, QoS level, and retain flag.
      will: {
        topic: this._topicPresence,
        payload: this._encodeBuffer<Presence>({
          peerId: this.peerId,
          status: PresenceStatus.LEAVE,
        }),
        qos: 2,
        retain: false,
      },
    });

    this._mqttClient.subscribe(this._topicPresence);
    this._mqttClient.subscribe(this._topicMessages);

    this._mqttClient.on("connect", () => {
      this._announcePresence(PresenceStatus.JOIN);

      this.emit("connect");
    });

    this._mqttClient.on("disconnect", (data: mqtt.IDisconnectPacket) => {
      this._emitLocalHostEvent("disconnect", data);
    });

    this._mqttClient.on("message", (topic, buffer) => {
      if (topic === this._topicMessages) {
        const data = this._decodeBuffer(buffer);

        this._emitLocalHostEvent("message", data);
      } else if (topic === this._topicPresence) {
        const data = this._decodeBuffer<Presence>(buffer);

        const { peerId, status } = data;
        if (peerId === this.peerId) {
          console.log("Ignoring local presence");
        } else {
          console.log("remote_presence", data);

          // TODO: Implement logic to track the presence of peers in the room.
          // As peer IDs are received, they should be recorded and added to the list of active peers, unless a peer has left.
          // After a debounce period with no new IDs, the list should be verified with other peers to ensure accuracy and reach a consensus.

          if (
            [
              PresenceStatus.JOIN,
              PresenceStatus.HERE,
              PresenceStatus.CHECKIN,
            ].includes(status)
          ) {
            this.peers.add(peerId);

            if (status !== PresenceStatus.HERE) {
              this._announcePresence(PresenceStatus.HERE);
            }

            console.log("remote peers", [...this.peers]);

            // TODO: Emit event if remote has joined
          } else if (status === PresenceStatus.LEAVE) {
            this.peers.delete(peerId);

            console.log("remote peers", [...this.peers]);

            // TODO: Emit event if remote has left
          }
        }
      }
    });

    this._mqttClient.on("close", () => {
      // Emitted after a disconnection.

      this.close();
    });

    this._mqttClient.on("reconnect", () => {
      // Emitted when a reconnect starts.

      console.log("Attempting to reconnect");
    });

    this._mqttClient.on("offline", () => {
      // Emitted when the client goes offline.

      console.log("Client is offline");
    });

    this._mqttClient.on("end", () => {
      // Emitted when mqtt.Client#end() is called. If a callback was passed to mqtt.Client#end(),
      // this event is emitted once the callback returns.

      console.log("Client has disconnected");
    });

    this._mqttClient.on("error", (err) => {
      // Emitted when the client cannot connect (i.e. connack rc != 0) or when a parsing error occurs.
      //
      // The following TLS errors will be emitted as an error event:
      //
      // ECONNREFUSED
      // ECONNRESET
      // EADDRINUSE
      // ENOTFOUND

      this.emit("error", err);
    });
  }

  // TODO: Add optional `qos`?
  send(data: string | Buffer | object) {
    const buffer = this._encodeBuffer(data);

    this._mqttClient.publish(this._topicMessages, buffer);
  }

  protected _announcePresence(status: Presence["status"]) {
    this._mqttClient.publish(
      this._topicPresence,
      // TODO: `status` could be `join` or `here` (if presence is reannounced)
      this._encodeBuffer<Presence>({ peerId: this.peerId, status }),
      { qos: 2, retain: false },
    );
  }

  // TODO: Possibly make `async` and wait on connection to end (`this._mqttClient.endAsync`)
  close() {
    // TODO: Determine if already closing or has closed before proceeding

    // https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientendforce-options-callback
    this._mqttClient.end();

    this.emit("close");
    this._emitLocalHostEvent("close");

    this.removeAllListeners();
  }
}

const callQueue: CallQueueItem[] = [];

interface CallQueueItem {
  functionName: string;
  args: unknown[];
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

async function handleWorkerConnection(
  brokerURL: string,
  roomName: string,
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void,
) {
  const workerRoom = new MQTTRoomWorker(brokerURL, roomName);

  const onError = (error: Error) => {
    workerRoom.off("connect", onConnect);
    reject(error);
  };

  const onConnect = () => {
    workerRoom.off("error", onError);
    resolve(workerRoom.peerId);
  };

  workerRoom.once("error", onError);
  workerRoom.once("connect", onConnect);
}

async function processQueue() {
  while (callQueue.length > 0) {
    const queueItem = callQueue.shift();

    if (queueItem) {
      const { functionName, args, resolve, reject } = queueItem;

      if (functionName === "connect-room") {
        const brokerURL = args[0] as string;
        const roomName = args[1] as string;

        await handleWorkerConnection(brokerURL, roomName, resolve, reject);
      } else if (functionName === "send") {
        const peerId = args[0] as string;
        const data = args[1] as string | Buffer;

        const workerRoom = roomWorkerMap.get(peerId);

        if (!workerRoom) {
          reject(`Unhandled worker room`);
        } else {
          resolve(workerRoom.send(data));
        }
      }
    }
  }
}

self.onmessage = async (event) => {
  const { functionName, args, messageId } = event.data;

  const promise = new Promise((resolve, reject) => {
    callQueue.push({ functionName, args, resolve, reject });
    if (callQueue.length === 1) {
      processQueue();
    }
  });

  promise
    .then((result) => {
      self.postMessage({
        [PostMessageStructKey.EnvelopeType]: EnvelopeType.Function,
        [PostMessageStructKey.Success]: true,
        [PostMessageStructKey.Result]: result,
        [PostMessageStructKey.MessageId]: messageId,
      });
    })
    .catch((error) => {
      self.postMessage({
        [PostMessageStructKey.EnvelopeType]: EnvelopeType.Function,
        [PostMessageStructKey.Success]: false,
        [PostMessageStructKey.Error]: error.message,
        [PostMessageStructKey.MessageId]: messageId,
      });
    });
};
