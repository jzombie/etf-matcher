import { ReactStateEmitter } from "./utils/StateEmitter";
import callWorkerFunction from "./utils/callWorkerFunction";

const IS_PROD = import.meta.env.PROD;

export type StoreStateProps = {
  isProductionBuild: boolean;
  isOnline: boolean;
  isRustInit: boolean;
  dataBuildTime: string;
  prettyDataBuildTime: string;
  count: number;
  isDirtyState: boolean;
  visibleSymbols: string[];
  isSearchModalOpen: boolean;
};

export type SearchResult = {
  s: string;
  c: string;
};

class _Store extends ReactStateEmitter<StoreStateProps> {
  constructor() {
    // TODO: Catch worker function errors and log them to the state so they can be piped up to the UI
    super({
      isProductionBuild: IS_PROD,
      isOnline: false,
      isRustInit: false,
      dataBuildTime: "",
      prettyDataBuildTime: "",
      count: 0,
      isDirtyState: false,
      visibleSymbols: [],
      isSearchModalOpen: false,
    });

    // Only deepfreeze in development
    this.shouldDeepfreeze = !IS_PROD;

    this._initWindowEvents();

    callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        isRustInit: true,
        dataBuildTime: (dataBuildInfo as { [key: string]: string }).time,
        prettyDataBuildTime: new Date(
          (dataBuildInfo as { [key: string]: string }).time
        ).toLocaleString(),
      });
    });

    // // TODO: Remove temporary
    // setInterval(() => {
    //   this.setState((prev) => ({
    //     count: prev.count + 1,
    //     isDirtyState: !prev.isDirtyState,
    //   }));
    // }, 1000);
  }

  private _initWindowEvents() {
    const _handleOnlineStatus = () => {
      this.setState({ isOnline: Boolean(navigator.onLine) });
    };

    _handleOnlineStatus();

    window.addEventListener("online", _handleOnlineStatus);
    window.addEventListener("offline", _handleOnlineStatus);

    return () => {
      window.removeEventListener("online", _handleOnlineStatus);
      window.removeEventListener("offline", _handleOnlineStatus);
    };
  }

  setVisibleSymbols(visibleSymbols: string[]) {
    this.setState({ visibleSymbols });
  }

  // TODO: For the following `PROTO` functions, it might be best to not retain a duplicate copy here,
  // except where absolutely needed (and utilize Rust for more `composite` metric generation).

  // TODO: Update type
  async searchSymbols(query: string): Promise<SearchResult[]> {
    try {
      // Call the worker function with the given query and trim any extra spaces
      const results = await callWorkerFunction<SearchResult[]>(
        "search_symbols",
        query.trim()
      );
      return results;
    } catch (error) {
      console.error("Error searching symbols:", error);
      throw error;
    }
  }

  // TODO: Document type (should be able to import from WASM type)
  async fetchSymbolDetail(symbol: string) {
    return callWorkerFunction("get_symbol_detail", symbol);
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

const store = new _Store();

export default store;
