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
