export interface MQTTRoomEvents {
  connect: [];
  connectingstateupdate: [boolean];
  connectionstateupdate: [boolean];
  reconnect: [];
  disconnect: [];
  offline: [];
  peersupdate: [string[]];
  syncupdate: [boolean];
  message: [
    {
      peerId: string;
      data: [string | Buffer | object];
    },
  ];
  close: [];
  error: [Error];
}

export enum EnvelopeType {
  Function = 1,
  Event = 2,
}

export enum PostMessageStructKey {
  EnvelopeType = 1,
  Success = 2,
  Result = 3,
  MessageId = 4,
  Error = 5,
  PeerId = 6,
  EventName = 7,
  EventData = 8,
}

export type SendOptions = {
  retain?: boolean;
  qos?: number;
};
