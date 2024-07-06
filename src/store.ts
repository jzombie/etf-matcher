import StateEmitter from "./utils/StateEmitter";
import callWorkerFunction from "./utils/callWorkerFunction";

type StoreStateProps = {
  isRustInit: boolean;
  dataBuildTime: string;
  prettyDataBuildTime: string;
  count: number;
  isDirtyState: boolean;
};

class Store extends StateEmitter<StoreStateProps> {
  constructor() {
    super({
      isRustInit: false,
      dataBuildTime: "",
      prettyDataBuildTime: "",
      count: 0,
      isDirtyState: false,
    });

    callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        isRustInit: true,
        dataBuildTime: (dataBuildInfo as any).time,
        prettyDataBuildTime: new Date(
          (dataBuildInfo as any).time
        ).toLocaleString(),
      });
    });

    // TODO: Remove temporary
    setInterval(() => {
      this.setState((prev) => ({
        count: prev.count + 1,
        isDirtyState: !prev.isDirtyState,
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
export type { StoreStateProps };
