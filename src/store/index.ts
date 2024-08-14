import store, {
  StateEmitterDefaultEvents,
  StoreStateProps,
  TickerBucket,
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
export type { TickerBucket, TickerBucketTicker, StoreStateProps };
