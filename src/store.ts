import { ReactStateEmitter } from "./utils/StateEmitter";
import callWorkerFunction from "./utils/callWorkerFunction";

const IS_PROD = import.meta.env.PROD;

type StoreStateProps = {
  isProductionBuild: boolean;
  isRustInit: boolean;
  dataBuildTime: string;
  prettyDataBuildTime: string;
  count: number;
  isDirtyState: boolean;
  visibleSymbols: string[];
};

class Store extends ReactStateEmitter<StoreStateProps> {
  constructor() {
    // TODO: Catch worker function errors and log them to the state so they can be piped up to the UI
    super({
      isProductionBuild: IS_PROD,
      isRustInit: false,
      dataBuildTime: "",
      prettyDataBuildTime: "",
      count: 0,
      isDirtyState: false,
      visibleSymbols: [],
    });

    // Only deepfreeze in development
    this.shouldDeepfreeze = !IS_PROD;

    callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        isRustInit: true,
        dataBuildTime: (dataBuildInfo as { [key: string]: string }).time,
        prettyDataBuildTime: new Date(
          (dataBuildInfo as { [key: string]: string }).time
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

  setVisibleSymbols(visibleSymbols: string[]) {
    this.setState({ visibleSymbols });
  }

  // TODO: For the following `PROTO` functions, it might be best to not retain a duplicate copy here,
  // except where absolutely needed (and utilize Rust for more `composite` metric generation).

  PROTO_getSymbols() {
    callWorkerFunction("get_symbols").then((symbols) => {
      console.log({ symbols });
    });
  }

  async searchSymbols(query: string): Promise<string[]> {
    return callWorkerFunction<string[]>("search_symbols", query);
  }

  async PROTO_getSymbolDetail(symbol: string) {
    callWorkerFunction("get_symbol_detail", symbol).then((detail) => {
      console.log(symbol, detail);
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

  addSymbolToPortfolio(symbol: string) {
    console.warn(`TODO: Handle symbol add: ${symbol}`);
  }

  // Add additional methods or properties if needed
}

const store = new Store();

export default store;
export type { StoreStateProps };
