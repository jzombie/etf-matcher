import { StateEmitterDefaultEvents } from "../StateEmitter";
import StateEmitter from "../StateEmitter";
import useStateEmitterReader from "./useStateEmitterReader";

export default class ReactStateEmitter<
  T extends Record<string, unknown>,
> extends StateEmitter<T> {
  /**
   * Creates a custom React hook for reading specific parts of the state
   * from the StateEmitter. This hook can be used in React components to
   * subscribe to state changes and trigger re-renders when the specified
   * state keys are updated.
   *
   * @returns {Function} A custom React hook that takes optional state keys
   * and event names, and returns the current state or partial state based on
   * the specified keys.
   *
   * @example
   * const useStateEmitterReader = store.createReactHookStateReader();
   * const { count, items } = useStateEmitterReader(["count", "items"]);
   */
  createReactHookStateReader() {
    return <K extends keyof T>(
      stateKeyOrKeys: K | K[],
      eventOrEventNames:
        | keyof T
        | StateEmitterDefaultEvents
        | (
            | keyof T
            | StateEmitterDefaultEvents
          )[] = StateEmitterDefaultEvents.UPDATE,
    ) => useStateEmitterReader<T, K>(this, stateKeyOrKeys, eventOrEventNames);
  }
}
