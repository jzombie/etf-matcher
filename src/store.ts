import EmitterState from "./utils/EmitterState";

interface CustomState {
  count: number;
  // Add other properties if needed
}

class Store extends EmitterState<CustomState> {
  state = {
    count: 0,
  };

  constructor(initialState?: CustomState) {
    super(initialState);

    // TODO: Remove
    setInterval(() => {
      this.setState("count", this.state.count + 1);

      console.log({
        count: this.state.count,
      });
    }, 1000);
  }

  // Add additional methods or properties if needed
}

const store = new Store();

export default store;
export type { CustomState };
