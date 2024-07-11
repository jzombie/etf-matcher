import {
  ReactStateEmitter,
  StateEmitterDefaultEvents,
} from "./utils/StateEmitter";
import callWorkerFunction from "./utils/callWorkerFunction";

const IS_PROD = import.meta.env.PROD;

export type SymbolBucketProps = {
  name: string;
  symbols: string[];
  type: "watchlist" | "portfolio" | "ticker_tape";
};

export type StoreStateProps = {
  isProductionBuild: boolean;
  isOnline: boolean;
  isRustInit: boolean;
  dataBuildTime: string;
  prettyDataBuildTime: string;
  isDirtyState: boolean;
  visibleSymbols: string[];
  isSearchModalOpen: boolean;
  symbolBuckets: SymbolBucketProps[];
};

export type SearchResult = {
  symbol: string;
  company: string;
};

export type SearchResultsWithTotalCount = {
  total_count: number;
  results: SearchResult[];
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
      isDirtyState: false,
      visibleSymbols: [],
      isSearchModalOpen: false,
      symbolBuckets: [
        {
          name: "My Portfolio",
          symbols: [],
          type: "portfolio",
        },
        {
          name: "My Watchlist",
          symbols: [],
          type: "watchlist",
        },
        {
          name: "My Ticker Tape",
          symbols: [],
          type: "ticker_tape",
        },
      ],
    });

    // Only deepfreeze in development
    this.shouldDeepfreeze = !IS_PROD;

    this._initLocalEvents();

    // TODO: Poll for data build info once every "x" to ensure the data is always running the latest version
    this._fetchDataBuildInfo();

    // TODO: Remove temporary
    // setInterval(() => {
    //   this.setState((prev) => ({
    //     isDirtyState: !prev.isDirtyState,
    //   }));
    // }, 1000);
  }

  private _initLocalEvents() {
    const _handleOnlineStatus = () => {
      this.setState({ isOnline: Boolean(navigator.onLine) });
    };

    _handleOnlineStatus();

    window.addEventListener("online", _handleOnlineStatus);
    window.addEventListener("offline", _handleOnlineStatus);

    const _handleVisibleSymbolsUpdate = (keys: (keyof StoreStateProps)[]) => {
      if (keys.includes("visibleSymbols")) {
        const { visibleSymbols } = this.getState(["visibleSymbols"]);

        // TODO: Handle this tracking
        console.log({ visibleSymbols });
      }
    };

    this.on(StateEmitterDefaultEvents.UPDATE, _handleVisibleSymbolsUpdate);

    return () => {
      window.removeEventListener("online", _handleOnlineStatus);
      window.removeEventListener("offline", _handleOnlineStatus);

      this.off(StateEmitterDefaultEvents.UPDATE, _handleVisibleSymbolsUpdate);
    };
  }

  setVisibleSymbols(visibleSymbols: string[]) {
    this.setState({ visibleSymbols });
  }

  private _fetchDataBuildInfo() {
    callWorkerFunction("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        isRustInit: true,
        // TODO: If data build time is already set as state, but this indicates otherwise, that's a signal the app needs to update
        dataBuildTime: (dataBuildInfo as { [key: string]: string }).time,
        prettyDataBuildTime: new Date(
          (dataBuildInfo as { [key: string]: string }).time
        ).toLocaleString(),
      });
    });
  }

  // TODO: For the following `PROTO` functions, it might be best to not retain a duplicate copy here,
  // except where absolutely needed (and utilize Rust for more `composite` metric generation).

  // TODO: Update type
  async searchSymbols(
    query: string,
    page: number = 1,
    page_size: number = 20
  ): Promise<SearchResultsWithTotalCount> {
    try {
      // Call the worker function with the given query and trim any extra spaces
      const results = await callWorkerFunction<SearchResultsWithTotalCount>(
        "search_symbols",
        query.trim(),
        page,
        page_size
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

  // PROTO_countEtfsPerExchange() {
  //   callWorkerFunction("count_etfs_per_exchange")
  //     .then((countsPerExchange) =>
  //       console.log({
  //         countsPerExchange,
  //       })
  //     )
  //     .catch((error) => console.error(error));
  // }

  // PROTO_getEtfHolderAssetCount() {
  //   const ETF_HOLDER_SYMBOL = "SPY";
  //   callWorkerFunction("get_etf_holder_asset_count", ETF_HOLDER_SYMBOL)
  //     .then((assetCount) =>
  //       console.log({
  //         etfHolder: ETF_HOLDER_SYMBOL,
  //         assetCount,
  //       })
  //     )
  //     .catch((error) => console.error(error));
  // }

  PROTO_getSymbolDetail(symbol: string) {
    callWorkerFunction("get_symbol_detail", symbol)
      .then((symbolDetail) =>
        console.log({
          symbol,
          symbolDetail,
        })
      )
      .catch((error) => console.error(error));
  }

  PROTO_getSymbolETFHolders(
    symbol: string,
    page: number = 1,
    page_size: number = 20
  ) {
    callWorkerFunction("get_symbol_etf_holders", symbol, page, page_size)
      .then((etfHolders) =>
        console.log({
          symbol,
          etfHolders,
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
