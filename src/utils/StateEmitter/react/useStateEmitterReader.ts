import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import EmitterState, { StateEmitterDefaultEvents } from "../StateEmitter";
import deepEqual from "@utils/deepEqual";

const useStateEmitterReader = <T extends object, K extends keyof T>(
  emitter: EmitterState<T>,
  stateKeyOrKeys: K | K[],
  eventOrEventNames: string | string[] = StateEmitterDefaultEvents.UPDATE
) => {
  // Dynamically apply `maxListeners` offset
  useEffect(() => {
    const maxListeners = emitter.getMaxListeners();
    emitter.setMaxListeners(maxListeners + 1);

    return () => {
      // Max listeners has to be re-obtained because the value may have changed
      // since the original call
      const maxListeners = emitter.getMaxListeners();
      emitter.setMaxListeners(maxListeners - 1);
    };
  }, [emitter]);

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

    // Add a type guard to ensure newSnapshot is of the expected type
    if (stateKeys && typeof newSnapshot === "object" && newSnapshot !== null) {
      // Ensure the stateKeys are in the newSnapshot
      const hasAllKeys = stateKeys.every((key) => key in newSnapshot);
      if (!hasAllKeys) {
        throw new Error("State keys not found in the snapshot");
      }
    }

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

  return state as Pick<T, K>;
};

export default useStateEmitterReader;
