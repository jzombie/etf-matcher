import { StateEmitterDefaultEvents } from "../StateEmitter";
import useStateEmitterReader from "./useStateEmitterReader";
import StateEmitter from "../StateEmitter";

export default class ReactStateEmitter<
  T extends Record<string, any>
> extends StateEmitter<T> {
  /**
   * Creates a custom React hook for reading specific parts of the state
   * from the StateEmitter. This hook can be used in React components to
   * subscribe to state changes and trigger re-renders when the specified
   * state keys are updated.
   */
  createReactHookStateReader() {
    return <K extends keyof T>(
      stateKeyOrKeys?: K | K[],
      eventOrEventNames: string | string[] = StateEmitterDefaultEvents.UPDATE
    ) => useStateEmitterReader<T, K>(this, stateKeyOrKeys, eventOrEventNames);
  }
}
