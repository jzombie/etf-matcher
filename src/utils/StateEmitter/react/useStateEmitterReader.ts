import { useSyncExternalStore, useCallback, useMemo, useRef } from "react";
import EmitterState, { StateEmitterDefaultEvents } from "../StateEmitter";
import deepEqual from "@utils/deepEqual";

const useStateEmitterReader = <T extends object, K extends keyof T>(
  emitter: EmitterState<T>,
  stateKeyOrKeys?: K | K[],
  eventOrEventNames: string | string[] = StateEmitterDefaultEvents.UPDATE
) => {
  const eventNames: K[] = useMemo(
    () =>
      (Array.isArray(eventOrEventNames)
        ? eventOrEventNames
        : [eventOrEventNames]) as K[],
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

  useMemo(() => {
    if (!stateKeys) {
      console.warn(
        "useStateEmitterReader should be called with `stateKeyOrKeys` to improve rendering performance."
      );
    }
  }, [stateKeys]);

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

  const getSnapshot = useCallback((): T | Partial<T> => {
    const newSnapshot = stateKeys
      ? emitter.getState(stateKeys)
      : emitter.getState();

    // Compare the new snapshot with the previous one using deep equality
    if (deepEqual(newSnapshot, prevSnapshotRef.current)) {
      return prevSnapshotRef.current!;
    }

    prevSnapshotRef.current = newSnapshot;
    return newSnapshot;
  }, [emitter, stateKeys]);

  const getCachedSnapshot = useMemo(() => getSnapshot, [getSnapshot]);

  const state = useSyncExternalStore(
    subscribe,
    getCachedSnapshot,
    getCachedSnapshot
  );

  return state;
};

export default useStateEmitterReader;
