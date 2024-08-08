import store, {
  StateEmitterDefaultEvents,
  StoreStateProps,
  TickerBucketProps,
  TickerBucketTicker,
  tickerBucketDefaultNames,
} from "./store";

export default store;
export { tickerBucketDefaultNames, StateEmitterDefaultEvents };
export type { TickerBucketProps, TickerBucketTicker, StoreStateProps };
