import { StateEmitterDefaultEvents } from "./StateEmitter";
import useStateEmitterReader from "./useStateEmitterReader";
import StateEmitter from "./StateEmitter";

export default class ReactStateEmitter<
  T extends Record<string, any>
> extends StateEmitter<T> {
  createReactHookStateReader() {
    return <K extends keyof T>(
      stateKeyOrKeys?: K | K[],
      eventOrEventNames: string | string[] = StateEmitterDefaultEvents.UPDATE
    ) => useStateEmitterReader<T, K>(this, stateKeyOrKeys, eventOrEventNames);
  }
}
