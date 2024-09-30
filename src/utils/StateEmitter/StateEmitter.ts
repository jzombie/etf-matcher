import EventEmitter from "events";

import customLogger from "@utils/customLogger";
import deepFreeze from "@utils/deepFreeze";

export enum StateEmitterDefaultEvents {
  UPDATE = "update",
}

// Note: Any React-specific functionality should not be directly tied into this class
// and instead used in the `ReactStateEmitter` extension class.
export default class StateEmitter<
  T extends Record<string, unknown>,
> extends EventEmitter {
  // Individual state keys can be subscribed to, so it's best to ensure that they don't
  // conflict with default events
  protected _reservedStateKeys: string[] = Object.keys(
    StateEmitterDefaultEvents,
  );

  private _state!: T;
  private _shouldDeepfreeze: boolean = true;
  private disposeFunctions: (() => void)[] = [];

  get shouldDeepfreeze(): boolean {
    return this._shouldDeepfreeze;
  }

  set shouldDeepfreeze(shouldDeepfreeze: boolean) {
    this._shouldDeepfreeze = shouldDeepfreeze;
    customLogger.debug(
      `Deepfreeze support ${this._shouldDeepfreeze ? "enabled" : "disabled"}.`,
    );
  }

  public readonly initialState: T;

  constructor(initialState: T) {
    super();

    // Try to get the initialState from the subclass if not provided
    if (!initialState) {
      throw new Error("Initial state must be provided.");
    }

    // Validate the initial state to ensure no conflicts with reserved events
    this._validateState(initialState);

    this.setState(initialState);

    // Check if structuredClone is available
    if (typeof structuredClone === "function") {
      this.initialState = deepFreeze(structuredClone(initialState));
    } else {
      customLogger.warn(
        "structuredClone is not available. Initial state will not be deeply cloned, which will affect immutability.",
      );
      this.initialState = deepFreeze({ ...initialState });
    }
  }

  // Method to validate the state for conflicts with reserved events
  private _validateState(state: T | Partial<T>) {
    for (const key in state) {
      if (this._reservedStateKeys.includes(key)) {
        throw new Error(`State key "${key}" conflicts with reserved event.`);
      }
    }
  }

  subscribe<K extends keyof T | StateEmitterDefaultEvents>(
    eventOrEventNames: K | K[],
    listener: () => void,
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

  setState(
    newStateOrUpdater: Partial<T> | ((prevState: T) => Partial<T>),
    emitUpdate = true,
  ) {
    let newState: Partial<T>;

    if (typeof newStateOrUpdater === "function") {
      const updaterFn = newStateOrUpdater as (prevState: T) => Partial<T>;
      newState = updaterFn(this._state);
    } else {
      newState = newStateOrUpdater as Partial<T>;
    }

    this._validateState(newState);

    this._state = { ...this._state, ...newState };

    if (emitUpdate) {
      this.emit(StateEmitterDefaultEvents.UPDATE, Object.keys(newState));
    }
  }

  // Use a getter to provide read-only access to the state
  getState<K extends keyof T>(keys?: K[]): Pick<T, K> | T {
    if (!keys) {
      return this._shouldDeepfreeze ? deepFreeze(this._state) : this._state;
    }

    const slice = keys.reduce(
      (acc, key) => {
        if (key in this._state) {
          acc[key] = this._state[key];
        }
        return acc;
      },
      {} as Pick<T, K>,
    );

    return this._shouldDeepfreeze ? deepFreeze(slice) : slice;
  }

  // Provide a read-only accessor for the entire state
  get state(): T {
    return this.getState() as T;
  }

  set state(value: T) {
    throw new Error("State is read-only. Use setState to modify the state.");
  }

  registerDispose(disposeFunction: () => void) {
    this.disposeFunctions.push(disposeFunction);
  }

  reset() {
    this.setState(this.initialState);
  }

  dispose() {
    this.disposeFunctions.forEach((fn) => fn());
    this.disposeFunctions = [];
    this.removeAllListeners();
  }
}
