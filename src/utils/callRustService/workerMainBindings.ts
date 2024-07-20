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

// `notifier.rs`
export enum NotifierEvent {
  XHR_REQUEST_CREATED = "xhr_request_created",
  XHR_REQUEST_OPENED = "xhr_request_opened",
  XHR_REQUEST_SENT = "xhr_request_sent",
  XHR_REQUEST_ERROR = "xhr_request_error",
  CACHE_ACCESSED = "cache_accessed",
  CACHE_ENTRY_INSERTED = "cache_entry_inserted",
  CACHE_ENTRY_REMOVED = "cache_entry_removed",
  CACHE_CLEARED = "cache_cleared",
}
