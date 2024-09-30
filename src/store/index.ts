// Note: `BaseStatePersistenceAdapter` is intentionally not exported here to
// avoid cyclic dependency issues during testing
import store, {
  IndexedDBPersistenceProps,
  StateEmitterDefaultEvents,
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
};
export type {
  TickerBucket,
  TickerBucketTicker,
  StoreStateProps,
  IndexedDBPersistenceProps,
};
