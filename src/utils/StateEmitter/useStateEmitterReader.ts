import { useSyncExternalStore, useMemo, useRef } from "react";
import EmitterState, { StateEmitterDefaultEvents } from "./StateEmitter";
import deepEqual from "../deepEqual";

const useStateEmitterReader = <
  T extends Record<string, any>,
  K extends keyof T
>(
  emitter: EmitterState<T>,
  stateKeyOrKeys?: K | K[],
  eventOrEventNames: string | string[] = StateEmitterDefaultEvents.UPDATE
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

  const prevSnapshotRef = useRef<T | Partial<T> | null>(null);

  const subscribe = (callback: () => void) => {
    const wrappedCallback = () => {
      callback();
    };

    const unsubscribe = emitter.subscribe(eventNames, wrappedCallback);

    return () => {
      unsubscribe();
    };
  };

  const getSnapshot = (): T | Partial<T> => {
    const newSnapshot = stateKeys
      ? emitter.getState(stateKeys)
      : emitter.getState();

    // Compare the new snapshot with the previous one using shallow equality
    if (deepEqual(newSnapshot, prevSnapshotRef.current)) {
      return prevSnapshotRef.current!;
    }

    prevSnapshotRef.current = newSnapshot;
    return newSnapshot;
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

  return state;
};

export default useStateEmitterReader;
