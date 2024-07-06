import EventEmitter from "events";

export enum StateEmitterDefaultEvents {
  UPDATE = "update",
}

export default class StateEmitter<
  T extends Record<string, any>
> extends EventEmitter {
  private _state: T;
  public readonly initialState: T;

  constructor(initialState: T) {
    super();

    // Try to get the initialState from the subclass if not provided
    if (!initialState) {
      throw new Error("Initial state must be provided.");
    }
    this._state = initialState;
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
    if (typeof newStateOrUpdater === "function") {
      const updaterFn = newStateOrUpdater as (prevState: T) => Partial<T>;
      const newState = updaterFn(this._state);
      this._state = { ...this._state, ...newState };
    } else {
      const newState = newStateOrUpdater as Partial<T>;
      this._state = { ...this._state, ...newState };
    }
    this.emit(StateEmitterDefaultEvents.UPDATE);
  }

  // Use a getter to provide read-only access to the state
  getState(keys?: (keyof T)[]): Partial<T> | T {
    if (!keys) {
      return Object.freeze({ ...this._state }); // Return a frozen copy to enforce immutability
    }

    const partialState = keys.reduce((acc, key) => {
      acc[key] = this._state[key];
      return acc;
    }, {} as Partial<T>);
    return Object.freeze(partialState); // Return a frozen copy to enforce immutability
  }

  // Provide a read-only accessor for the entire state
  get state(): T {
    return Object.freeze({ ...this._state }); // Return a frozen copy to enforce immutability
  }
}
