import EventEmitter from "events";
import deepFreeze from "@utils/deepFreeze";

export enum StateEmitterDefaultEvents {
  UPDATE = "update",
}

// Note: Any React-specific functionality should not be directly tied into this class
// and instead used in the `ReactStateEmitter` extension class.
export default class StateEmitter<
  T extends Record<string, any>
> extends EventEmitter {
  // Individual state keys can be subscribed to, so it's best to ensure that they don't
  // conflict with default events
  protected _reservedStateKeys: string[] = Object.keys(
    StateEmitterDefaultEvents
  );

  private _state!: T;
  private _frozenState!: T;

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
    this.initialState = Object.freeze({ ...initialState });
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
    let newState: Partial<T>;

    if (typeof newStateOrUpdater === "function") {
      const updaterFn = newStateOrUpdater as (prevState: T) => Partial<T>;
      newState = updaterFn(this._state);
    } else {
      newState = newStateOrUpdater as Partial<T>;
    }

    this._validateState(newState);

    this._state = { ...this._state, ...newState };
    this._frozenState = deepFreeze({ ...this._state });
    this.emit(StateEmitterDefaultEvents.UPDATE);
  }

  // Use a getter to provide read-only access to the state
  getState(keys?: (keyof T)[]): Partial<T> | T {
    if (!keys) {
      return this._frozenState;
    }

    const partialState = keys.reduce((acc, key) => {
      acc[key] = this._frozenState[key];
      return acc;
    }, {} as Partial<T>);
    return partialState;
  }

  // Provide a read-only accessor for the entire state
  get state(): T {
    return this._frozenState;
  }

  set state(value: T) {
    throw new Error("State is read-only. Use setState to modify the state.");
  }
}
