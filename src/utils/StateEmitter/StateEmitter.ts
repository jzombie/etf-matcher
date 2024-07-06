import EventEmitter from "events";
import deepFreeze from "../deepFreeze";

export enum StateEmitterDefaultEvents {
  UPDATE = "update",
}

export default class StateEmitter<
  T extends Record<string, any>
> extends EventEmitter {
  private _state!: T;
  private _frozenState!: T;

  public readonly initialState: T;

  constructor(initialState: T) {
    super();

    // Try to get the initialState from the subclass if not provided
    if (!initialState) {
      throw new Error("Initial state must be provided.");
    }
    this.setState(initialState);
    this.initialState = Object.freeze({ ...initialState });
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
    let newState: Partial<T>;

    if (typeof newStateOrUpdater === "function") {
      const updaterFn = newStateOrUpdater as (prevState: T) => Partial<T>;
      newState = updaterFn(this._state);
    } else {
      newState = newStateOrUpdater as Partial<T>;
    }

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
