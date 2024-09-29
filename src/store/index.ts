import BaseStatePersistenceAdapter from "./BaseStatePersistenceAdapter";
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
  BaseStatePersistenceAdapter,
};
export type {
  TickerBucket,
  TickerBucketTicker,
  StoreStateProps,
  IndexedDBPersistenceProps,
};
