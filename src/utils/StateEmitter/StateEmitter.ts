import EventEmitter from "events";

export enum StateEmitterDefaultEvents {
  UPDATE = "update",
}

export default class StateEmitter<
  T extends Record<string, any>
> extends EventEmitter {
  state: T = {} as T;

  constructor(initialState?: T) {
    super();

    if (initialState) {
      this.state = initialState;
    }
  }

  subscribe<K extends keyof T>(
    eventOrEventNames: K | K[],
    listener: () => void
  ): () => void {
    const eventNames = Array.isArray(eventOrEventNames)
      ? eventOrEventNames
      : [eventOrEventNames];

    eventNames.forEach((eventName) => {
      this.on(eventName as string, listener);
    });

    return () => {
      eventNames.forEach((eventName) => {
        this.off(eventName as string, listener);
      });
    };
  }

  setState(newStateOrUpdater: Partial<T> | ((prevState: T) => Partial<T>)) {
    if (typeof newStateOrUpdater === "function") {
      const updaterFn = newStateOrUpdater as (prevState: T) => Partial<T>;
      const newState = updaterFn(this.state);
      this.state = { ...this.state, ...newState };
    } else {
      const newState = newStateOrUpdater as Partial<T>;
      this.state = { ...this.state, ...newState };
    }
    this.emit(StateEmitterDefaultEvents.UPDATE);
  }

  getState(keys?: (keyof T)[]): Partial<T> | T {
    if (!keys) {
      return this.state;
    }

    return keys.reduce((acc, key) => {
      acc[key] = this.state[key];
      return acc;
    }, {} as Partial<T>);
  }

  /**
   * Compares two states, performing a shallow equality check to determine
   * whether they are identical. This method is useful for optimizing
   * state updates by avoiding unnecessary re-renders when the state
   * has not changed.
   *
   * The comparison checks:
   * - If both states are strictly equal, it returns true.
   * - If either state is null, it returns false.
   * - If the states have different numbers of keys, it returns false.
   * - For each key in the previous state, it verifies the key exists
   *   in the next state and that the corresponding values are strictly equal.
   */
  // shallowEqual(
  //   prevState: Partial<T> | T | null,
  //   nextState: Partial<T> | T | null
  // ): boolean {
  //   if (prevState === nextState) {
  //     return true;
  //   }

  //   if (prevState === null || nextState === null) {
  //     return false;
  //   }

  //   const keysA = Object.keys(prevState);
  //   const keysB = Object.keys(nextState);

  //   if (keysA.length !== keysB.length) {
  //     return false;
  //   }

  //   for (let i = 0; i < keysA.length; i++) {
  //     if (
  //       !Object.prototype.hasOwnProperty.call(nextState, keysA[i]) ||
  //       prevState[keysA[i]] !== nextState[keysA[i]]
  //     ) {
  //       return false;
  //     }
  //   }

  //   return true;
  // }
}
