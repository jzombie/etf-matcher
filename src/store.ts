import {
  ReactStateEmitter,
  StateEmitterDefaultEvents,
} from "./utils/StateEmitter";
import libCallWorkerFunction from "./utils/callWorkerFunction";

const IS_PROD = import.meta.env.PROD;

export type SymbolBucketProps = {
  name: string;
  symbols: string[];
  type: "watchlist" | "portfolio" | "ticker_tape" | "attention_tracker";
  requiresQuantity: boolean;
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
  isProfilingCache: boolean;
};

export type SearchResult = {
  symbol: string;
  company: string;
};

export type SearchResultsWithTotalCount = {
  total_count: number;
  results: SearchResult[];
};

const TEMP_PROTO_libCallWorkerFunction = libCallWorkerFunction;

// TODO: Wrap `callWorkerFunction` and update cache metrics if profiling cache
//
//   |___  Include notification (and route to UI) showing data fetching status
// (potentially show in red, just above the ticker tape)

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
          requiresQuantity: true,
        },
        {
          name: "My Watchlist",
          symbols: [],
          type: "watchlist",
          requiresQuantity: false,
        },
        {
          name: "My Ticker Tape",
          symbols: [],
          type: "ticker_tape",
          requiresQuantity: false,
        },
        // TODO: Infer potential ETFs that a user may be interested in based on searched
        // symbols and the frequency of the most common ETFs that hold those symbols
        {
          name: "My Attention Tracker",
          symbols: [],
          type: "attention_tracker",
          requiresQuantity: false,
        },
      ],
      isProfilingCache: false,
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
    TEMP_PROTO_libCallWorkerFunction("get_data_build_info").then(
      (dataBuildInfo) => {
        this.setState({
          isRustInit: true,
          // TODO: If data build time is already set as state, but this indicates otherwise, that's a signal the app needs to update
          dataBuildTime: (dataBuildInfo as { [key: string]: string }).time,
          prettyDataBuildTime: new Date(
            (dataBuildInfo as { [key: string]: string }).time
          ).toLocaleString(),
        });
      }
    );
  }

  // TODO: For the following `PROTO` functions, it might be best to not retain a duplicate copy here,
  // except where absolutely needed (and utilize Rust for more `composite` metric generation).

  // TODO: Update type (use pagination type with generics)
  async searchSymbols(
    query: string,
    page: number = 1,
    pageSize: number = 20,
    onlyExactMatches: boolean = false
  ): Promise<SearchResultsWithTotalCount> {
    try {
      // Call the worker function with the given query and trim any extra spaces
      const results =
        await TEMP_PROTO_libCallWorkerFunction<SearchResultsWithTotalCount>(
          "search_symbols",
          query.trim(),
          page,
          pageSize,
          onlyExactMatches
        );

      return results;
    } catch (error) {
      console.error("Error searching symbols:", error);
      throw error;
    }
  }
  async getSymbolETFHolders(
    symbol: string,
    page: number = 1,
    pageSize: number = 20
  ) {
    return TEMP_PROTO_libCallWorkerFunction(
      "get_symbol_etf_holders",
      symbol,
      page,
      pageSize
    );
  }

  // TODO: Document type (should be able to import from WASM type)
  async fetchSymbolDetail(symbol: string) {
    return TEMP_PROTO_libCallWorkerFunction("get_symbol_detail", symbol);
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
    TEMP_PROTO_libCallWorkerFunction("get_symbol_detail", symbol)
      .then((symbolDetail) =>
        console.log({
          symbol,
          symbolDetail,
        })
      )
      .catch((error) => console.error(error));
  }

  PROTO_getCacheSize() {
    TEMP_PROTO_libCallWorkerFunction("get_cache_size")
      .then((cacheSize) =>
        console.log({
          cacheSize,
        })
      )
      .catch((error) => console.error(error));
  }

  PROTO_getCacheDetails() {
    TEMP_PROTO_libCallWorkerFunction("get_cache_details")
      .then((cacheDetails) =>
        console.log({
          cacheDetails,
        })
      )
      .catch((error) => console.error(error));
  }

  PROTO_removeCacheEntry(key: string) {
    TEMP_PROTO_libCallWorkerFunction("remove_cache_entry", key);
  }

  PROTO_clearCache() {
    TEMP_PROTO_libCallWorkerFunction("clear_cache");
  }

  addSymbolToBucket(symbol: string, symbolBucket: SymbolBucketProps) {
    this.setState((prevState) => {
      const symbolBuckets = prevState.symbolBuckets.map((bucket) => {
        if (bucket.name === symbolBucket.name) {
          return {
            ...bucket,
            symbols: Array.from(new Set([...bucket.symbols, symbol])),
          };
        }
        return bucket;
      });

      return { symbolBuckets };
    });

    // TODO: Show UI notification
  }
}

const store = new _Store();

export default store;
