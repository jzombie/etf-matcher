import StateEmitter from "./utils/StateEmitter";
import callWorkerFunction from "./utils/callWorkerFunction";

interface CustomState {
  dataBuildTime: string;
  count: number;
  // Add other properties if needed
}

class Store extends StateEmitter<CustomState> {
  constructor() {
    super({
      dataBuildTime: "",
      count: 0,
    });

    callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        dataBuildTime: (dataBuildInfo as any).time,
      });
    });

    // TODO: Remove
    setInterval(() => {
      this.setState((prev) => ({
        count: prev.count + 1,
      }));
    }, 1000);
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
