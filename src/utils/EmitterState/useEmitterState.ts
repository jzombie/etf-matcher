import { useSyncExternalStore, useMemo } from "react";
import EmitterState from "./EmitterState";

const useEmitterState = <T extends Record<string, any>, K extends keyof T>(
  emitter: EmitterState<T>,
  stateKeyOrKeys?: K | K[],
  eventOrEventNames: string | string[] = "change"
) => {
  const eventNames = useMemo(
    () =>
      Array.isArray(eventOrEventNames)
        ? eventOrEventNames
        : [eventOrEventNames],
    [eventOrEventNames]
  );

  const stateKeys = useMemo(
    () =>
      Array.isArray(stateKeyOrKeys)
        ? stateKeyOrKeys
        : stateKeyOrKeys
        ? [stateKeyOrKeys]
        : undefined,
    [stateKeyOrKeys]
  );

  const subscribe = (callback: () => void) => {
    const wrappedCallback = () => {
      callback();
    };

    const unsubscribe = emitter.subscribe(eventNames, wrappedCallback);

    return () => {
      unsubscribe();
    };
  };

  const getSnapshot = () => {
    const state = emitter.getState(stateKeys);
    return JSON.stringify(state); // Cache the state as a string
  };

  const getCachedSnapshot = useMemo(
    () => getSnapshot,
    [emitter, eventNames, stateKeys]
  );

  const state = useSyncExternalStore(
    subscribe,
    getCachedSnapshot,
    getCachedSnapshot
  );

  return useMemo(() => JSON.parse(state), [state]);
};

export default useEmitterState;
