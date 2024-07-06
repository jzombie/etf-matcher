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

  setState<K extends keyof T>(key: K, newState: T[K]) {
    this.state[key] = newState;
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
