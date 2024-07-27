import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import customLogger from "@utils/customLogger";
import deepEqual from "@utils/deepEqual";

import EmitterState, { StateEmitterDefaultEvents } from "../StateEmitter";

const useStateEmitterReader = <T extends object, K extends keyof T>(
  emitter: EmitterState<T>,
  stateKeyOrKeys: K | K[],
  eventOrEventNames:
    | keyof T
    | StateEmitterDefaultEvents
    | (
        | keyof T
        | StateEmitterDefaultEvents
      )[] = StateEmitterDefaultEvents.UPDATE,
) => {
  // Dynamically apply `maxListeners` offset
  //
  // This sidesteps an issue where the emitter will emit a warning if the max
  // number of listeners has been exceeded if using many hooks to read state.
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

  const eventNames = useMemo(
    () =>
      Array.isArray(eventOrEventNames)
        ? eventOrEventNames
        : [eventOrEventNames],
    [eventOrEventNames],
  );

  const stateKeys = useMemo(
    () =>
      Array.isArray(stateKeyOrKeys)
        ? stateKeyOrKeys
        : stateKeyOrKeys
          ? [stateKeyOrKeys]
          : undefined,
    [stateKeyOrKeys],
  );

  useMemo(() => {
    if (!stateKeys) {
      customLogger.warn(
        "useStateEmitterReader should be called with `stateKeyOrKeys` to improve rendering performance.",
      );
    }
  }, [stateKeys]);

  const prevSnapshotRef = useRef<T | Pick<T, K> | null>(null);

  const subscribe = (callback: () => void) => {
    const wrappedCallback = () => {
      callback();
    };

    const unsubscribe = emitter.subscribe(eventNames, wrappedCallback);

    return () => {
      unsubscribe();
    };
  };

  const getSnapshot = useCallback((): T | Pick<T, K> => {
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
    getCachedSnapshot,
  );

  return state as Pick<T, K>;
};

export default useStateEmitterReader;
