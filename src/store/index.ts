// Note: `BaseStatePersistenceAdapter` is intentionally not exported here to
// avoid cyclic dependency issues during testing
import store, {
  IndexedDBPersistenceProps,
  StateEmitterDefaultEvents,
  Store,
  StoreStateProps,
  TickerBucket,
  TickerBucketNameError,
  TickerBucketTicker,
  multiBucketInstancesAllowed,
  tickerBucketDefaultNames,
} from "./store";

export default store;
export {
  tickerBucketDefaultNames,
  StateEmitterDefaultEvents,
  multiBucketInstancesAllowed,
  TickerBucketNameError,
  Store,
};
export type {
  TickerBucket,
  TickerBucketTicker,
  StoreStateProps,
  IndexedDBPersistenceProps,
};
