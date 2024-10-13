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
  NETWORK_CACHE_ACCESSED = "network_cache_accessed",
  NETWORK_CACHE_ENTRY_INSERTED = "network_cache_entry_inserted",
  NETWORK_CACHE_ENTRY_REMOVED = "network_cache_entry_removed",
  NETWORK_CACHE_CLEARED = "network_cache_cleared",
}
