import store, { StoreStateProps } from "@src/store";
import {
  useStateEmitterReader,
  StateEmitterDefaultEvents,
} from "@utils/StateEmitter";

export default function useStoreStateReader<K extends keyof StoreStateProps>(
  stateKeyOrKeys?: K | K[],
  eventOrEventNames: string | string[] = StateEmitterDefaultEvents.UPDATE
) {
  return useStateEmitterReader<StoreStateProps, K>(
    store,
    stateKeyOrKeys,
    eventOrEventNames
  );
}

export { store };
