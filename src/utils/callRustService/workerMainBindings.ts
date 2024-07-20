export enum EnvelopeType {
  Function = 1,
  NotifiyEvent = 2,
}

export enum PostMessageStructKey {
  EnvelopeType = 1,
  Success = 2,
  Result = 3,
  MessageId = 4,
  Error = 5,
  NotifierEventType = 6,
  NotifierArgs = 7,
}
