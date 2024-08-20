import store, {
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
};
export type {
  TickerBucket,
  TickerBucketTicker,
  TickerBucketNameError,
  StoreStateProps,
};
