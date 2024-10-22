import { Buffer } from "buffer";

import { SendOptions } from "./MQTTRoom.sharedBindings";
import MQTTRoomBase from "./MQTTRoomBase";

export default class MQTTRoom extends MQTTRoomBase {
  constructor(brokerURL: string, roomName: string) {
    super(brokerURL, roomName);

    // TODO: If switching to `DisposableEmitter`, use the `setTimeout` method it provides
    //
    // Note: `queueMicrotask` is not sufficient here for letting React be aware
    // of the `connecting state` prior to connect
    setTimeout(() => {
      this._connect();
    });
  }

  async send(data: string | Buffer | object, options?: SendOptions) {
    super.send(data, options);
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

  get peers() {
    return this._peers;
  }

  async close() {
    return super.close();
  }
}
