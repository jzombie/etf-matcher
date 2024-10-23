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

  // The following getters are inherited from MQTTRoomBase and can be used directly:
  // - peerId
  // - peers
  // - isInSync
  // - roomName
  // - isConnecting
  // - isConnected

  async send(data: string | Buffer | object, options?: SendOptions) {
    return super.send(data, options);
  }

  async close() {
    return super.close();
  }
}
