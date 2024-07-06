import EventEmitter from "events";

export enum EmitterStateDefaultEvents {
  UPDATE = "update",
}

export default class EmitterState<
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
    this.emit(EmitterStateDefaultEvents.UPDATE);
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
}
