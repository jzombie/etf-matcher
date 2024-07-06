import { useSyncExternalStore, useMemo, useRef } from "react";
import EmitterState, { EmitterStateDefaultEvents } from "./EmitterState";

const useEmitterState = <T extends Record<string, any>, K extends keyof T>(
  emitter: EmitterState<T>,
  stateKeyOrKeys?: K | K[],
  eventOrEventNames: string | string[] = EmitterStateDefaultEvents.UPDATE
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

  const shallowEqual = (objA: any, objB: any): boolean => {
    if (objA === objB) {
      return true;
    }

    if (
      typeof objA !== "object" ||
      objA === null ||
      typeof objB !== "object" ||
      objB === null
    ) {
      return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let i = 0; i < keysA.length; i++) {
      if (!objB.hasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        return false;
      }
    }

    return true;
  };

  const getSnapshot = (): T | Partial<T> => {
    const newSnapshot = stateKeys
      ? emitter.getState(stateKeys)
      : emitter.getState();

    // Compare the new snapshot with the previous one using shallow equality
    if (shallowEqual(newSnapshot, prevSnapshotRef.current)) {
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

export default useEmitterState;
