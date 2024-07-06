import EmitterState from "./utils/EmitterState";
import callWorkerFunction from "./utils/callWorkerFunction";

interface CustomState {
  dataBuildTime: string;
  // Add other properties if needed
}

class Store extends EmitterState<CustomState> {
  constructor(initialState?: CustomState) {
    super(initialState);

    callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        dataBuildTime: (dataBuildInfo as any).time,
      });
    });
  }

  PROTO_getSymbols() {
    callWorkerFunction("get_symbols").then((symbols) => {
      console.log({ symbols });
    });
  }

  PROTO_countEtfsPerExchange() {
    callWorkerFunction("count_etfs_per_exchange")
      .then((countsPerExchange) =>
        console.log({
          countsPerExchange,
        })
      )
      .catch((error) => console.error(error));
  }

  PROTO_getEtfHolderAssetCount() {
    const ETF_HOLDER_SYMBOL = "SPY";
    callWorkerFunction("get_etf_holder_asset_count", ETF_HOLDER_SYMBOL)
      .then((assetCount) =>
        console.log({
          etfHolder: ETF_HOLDER_SYMBOL,
          assetCount,
        })
      )
      .catch((error) => console.error(error));
  }

  // Add additional methods or properties if needed
}

const store = new Store();

export default store;
export type { CustomState };
