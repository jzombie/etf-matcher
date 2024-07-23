import { ReactStateEmitter } from "@utils/StateEmitter";
import callRustService, {
  subscribe as libRustServiceSubscribe,
  NotifierEvent,
} from "@utils/callRustService";
import {
  RustServiceSymbolDetail,
  RustServiceSearchResultsWithTotalCount,
  RustServiceETFHoldersWithTotalCount,
  RustServiceCacheDetail,
  RustServiceETFAggregateDetail,
  RustServiceImageInfo,
} from "@utils/callRustService";
import {
  XHROpenedRequests,
  CacheAccessedRequests,
} from "./OpenedNetworkRequests";

import detectHTMLJSVersionSync from "@utils/PROTO_detectHTMLJSVersionSync";
import customLogger from "@utils/customLogger";

import debounceWithKey from "@utils/debounceWithKey";

const IS_PROD = import.meta.env.PROD;

export type SymbolBucketProps = {
  name: string;
  symbols: string[];
  type:
    | "watchlist"
    | "portfolio"
    | "ticker_tape"
    | "recently_viewed"
    | "attention_tracker";
  requiresQuantity: boolean;
  isUserConfigurable: boolean;
};

export type StoreStateProps = {
  isHTMLJSVersionSynced: boolean;
  isAppUnlocked: boolean;
  isGAPageTrackingEnabled: boolean;
  isProductionBuild: boolean;
  isOnline: boolean;
  isRustInit: boolean;
  dataBuildTime: string;
  prettyDataBuildTime: string;
  isDirtyState: boolean;
  visibleSymbols: string[];
  isSearchModalOpen: boolean;
  symbolBuckets: SymbolBucketProps[];
  isProfilingCacheOverlayOpen: boolean;
  cacheProfilerWaitTime: number;
  cacheDetails: RustServiceCacheDetail[];
  cacheSize: number;
  rustServiceXHRRequestErrors: {
    [pathName: string]: {
      errCount: number;
      lastTimestamp: string;
    };
  };
  latestXHROpenedRequestPathName: string | null;
  latestCacheOpenedRequestPathName: string | null;
};

class _Store extends ReactStateEmitter<StoreStateProps> {
  constructor() {
    // TODO: Catch worker function errors and log them to the state so they can be piped up to the UI
    super({
      isHTMLJSVersionSynced: detectHTMLJSVersionSync(),
      isAppUnlocked: false,
      isGAPageTrackingEnabled: false,
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
          isUserConfigurable: true,
        },
        {
          name: "My Watchlist",
          symbols: [],
          type: "watchlist",
          requiresQuantity: false,
          isUserConfigurable: true,
        },
        {
          name: "My Ticker Tape",
          symbols: [],
          type: "ticker_tape",
          requiresQuantity: false,
          isUserConfigurable: true,
        },
        {
          name: "My Recently Viewed",
          symbols: [],
          type: "recently_viewed",
          requiresQuantity: false,
          isUserConfigurable: false,
        },
        // TODO: Infer potential ETFs that a user may be interested in based on searched
        // symbols and the frequency of the most common ETFs that hold those symbols
        {
          name: "My Attention Tracker",
          symbols: [],
          type: "attention_tracker",
          requiresQuantity: false,
          isUserConfigurable: false,
        },
      ],
      isProfilingCacheOverlayOpen: false,
      cacheProfilerWaitTime: 500,
      cacheDetails: [],
      cacheSize: 0,
      rustServiceXHRRequestErrors: {},
      latestXHROpenedRequestPathName: null,
      latestCacheOpenedRequestPathName: null,
    });

    // Only deepfreeze in development
    this.shouldDeepfreeze = !IS_PROD;

    this._initLocalEvents();

    // TODO: Poll for data build info once every "x" to ensure the data is always running the latest version
    this._fetchDataBuildInfo();

    // Make initial searches faster
    this._preloadSymbolSearchCache();

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

    // TODO: Reintegrate or use this pattern as needed
    // const _handleVisibleSymbolsUpdate = (keys: (keyof StoreStateProps)[]) => {
    //   if (keys.includes("visibleSymbols")) {
    //     const { visibleSymbols } = this.getState(["visibleSymbols"]);

    //     // TODO: Handle this tracking
    //     // console.log({ visibleSymbols });
    //   }
    // };

    // this.on(StateEmitterDefaultEvents.UPDATE, _handleVisibleSymbolsUpdate);

    // Instantiate and set up event bindings for `OpenNetworkRequests`
    const { xhrOpenedRequests, cacheAccessedRequests } = (() => {
      const xhrOpenedRequests = new XHROpenedRequests();
      const cacheAccessedRequests = new CacheAccessedRequests();

      xhrOpenedRequests.emitter.on(
        XHROpenedRequests.PATH_OPENED,
        (pathName: string) => {
          this.setState({
            latestXHROpenedRequestPathName: pathName,
          });
        }
      );

      xhrOpenedRequests.emitter.on(
        XHROpenedRequests.PATH_CLOSED,
        (pathName: string) => {
          if (this.state.latestXHROpenedRequestPathName === pathName) {
            this.setState({
              latestXHROpenedRequestPathName: null,
            });
          }
        }
      );

      cacheAccessedRequests.emitter.on(
        CacheAccessedRequests.PATH_OPENED,
        (pathName: string) => {
          this.setState({
            latestCacheOpenedRequestPathName: pathName,
          });
        }
      );

      cacheAccessedRequests.emitter.on(
        CacheAccessedRequests.PATH_CLOSED,
        (pathName: string) => {
          if (this.state.latestCacheOpenedRequestPathName === pathName) {
            this.setState({
              latestCacheOpenedRequestPathName: null,
            });
          }
        }
      );

      return { xhrOpenedRequests, cacheAccessedRequests };
    })();

    const libRustServiceUnsubscribe = libRustServiceSubscribe(
      (eventType: NotifierEvent, args: unknown[]) => {
        const pathName: string = args[0] as string;

        if (eventType === NotifierEvent.XHR_REQUEST_CREATED) {
          // Signal open XHR request
          xhrOpenedRequests.add(pathName);
        }

        if (eventType === NotifierEvent.XHR_REQUEST_ERROR) {
          // Signal closed XHR request
          xhrOpenedRequests.delete(pathName);

          const xhrRequestErrors = {
            ...this.state.rustServiceXHRRequestErrors,
            [pathName]: {
              errCount: this.state.rustServiceXHRRequestErrors[pathName]
                ?.errCount
                ? this.state.rustServiceXHRRequestErrors[pathName]?.errCount + 1
                : 1,
              lastTimestamp: new Date().toISOString(),
            },
          };
          this.setState({
            rustServiceXHRRequestErrors: xhrRequestErrors,
          });
        }

        if (eventType === NotifierEvent.XHR_REQUEST_SENT) {
          // Signal closed XHR request
          xhrOpenedRequests.delete(pathName);

          // If a subsequent XHR request path is the same as a previous error, delete the error
          if (pathName in this.state.rustServiceXHRRequestErrors) {
            const next = { ...this.state.rustServiceXHRRequestErrors };
            delete next[pathName];

            this.setState({
              rustServiceXHRRequestErrors: next,
            });
          }
        }

        if (eventType === NotifierEvent.CACHE_ACCESSED) {
          // Signal open cache request (auto-closes)
          cacheAccessedRequests.add(pathName);
        }

        if (
          [
            NotifierEvent.CACHE_ENTRY_INSERTED,
            NotifierEvent.CACHE_ENTRY_REMOVED,
            NotifierEvent.CACHE_CLEARED,
          ].includes(eventType)
        ) {
          debounceWithKey(
            "store:cache_profiler",
            () => {
              callRustService<number>("get_cache_size").then((cacheSize) => {
                this.setState({ cacheSize });
              });
              callRustService<RustServiceCacheDetail[]>(
                "get_cache_details"
              ).then((cacheDetails) => this.setState({ cacheDetails }));
            },
            this.state.cacheProfilerWaitTime
          );
        }
      }
    );

    return () => {
      window.removeEventListener("online", _handleOnlineStatus);
      window.removeEventListener("offline", _handleOnlineStatus);

      libRustServiceUnsubscribe();

      // this.off(StateEmitterDefaultEvents.UPDATE, _handleVisibleSymbolsUpdate);
    };
  }

  setVisibleSymbols(visibleSymbols: string[]) {
    this.setState({ visibleSymbols });
  }

  private _fetchDataBuildInfo() {
    callRustService("get_data_build_info").then((dataBuildInfo) => {
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

  private async _preloadSymbolSearchCache() {
    return callRustService("preload_symbol_search_cache");
  }

  // PROTO_getCacheDetails() {
  //   callRustService<RustServiceCacheDetail[]>("get_cache_details")
  //     .then(console.table)
  //     .catch((error) => console.error(error));
  // }

  // TODO: For the following `PROTO` functions, it might be best to not retain a duplicate copy here,
  // except where absolutely needed (and utilize Rust for more `composite` metric generation).

  // TODO: Update type (use pagination type with generics)
  async searchSymbols(
    query: string,
    page: number = 1,
    pageSize: number = 20,
    onlyExactMatches: boolean = false,
    abortSignal?: AbortSignal
  ): Promise<RustServiceSearchResultsWithTotalCount> {
    return callRustService<RustServiceSearchResultsWithTotalCount>(
      "search_symbols",
      [query.trim(), page, pageSize, onlyExactMatches],
      abortSignal
    );
  }
  async fetchSymbolETFHolders(
    symbol: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<RustServiceETFHoldersWithTotalCount> {
    return callRustService<RustServiceETFHoldersWithTotalCount>(
      "get_symbol_etf_holders",
      [symbol, page, pageSize]
    );
  }

  async fetchSymbolDetail(symbol: string): Promise<RustServiceSymbolDetail> {
    return callRustService<RustServiceSymbolDetail>("get_symbol_detail", [
      symbol,
    ]);
  }

  async fetchETFAggregateDetail(
    etfSymbol: string
  ): Promise<RustServiceETFAggregateDetail> {
    return callRustService<RustServiceETFAggregateDetail>(
      "get_etf_aggregate_detail",
      [etfSymbol]
    );
  }

  // PROTO_countEtfsPerExchange() {
  //   callRustService("count_etfs_per_exchange")
  //     .then((countsPerExchange) =>
  //       console.log({
  //         countsPerExchange,
  //       })
  //     )
  //     .catch((error) => console.error(error));
  // }

  // PROTO_getEtfHolderAssetCount() {
  //   const ETF_HOLDER_SYMBOL = "SPY";
  //   callRustService("get_etf_holder_asset_count", ETF_HOLDER_SYMBOL)
  //     .then((assetCount) =>
  //       console.log({
  //         etfHolder: ETF_HOLDER_SYMBOL,
  //         assetCount,
  //       })
  //     )
  //     .catch((error) => console.error(error));
  // }

  fetchImageBase64(filename: string): Promise<RustServiceImageInfo> {
    return callRustService<RustServiceImageInfo>("get_image_base64", [
      filename,
    ]);
  }

  // TODO: Remove; just debugging; probably don't need to expose this
  PROTO_fetchSymbolWithId(tickerId: number) {
    callRustService("get_symbol_with_id", [tickerId]).then(customLogger.debug);
  }

  // TODO: Remove; just debugging; probably don't need to expose this
  PROTO_fetchExchangeIdWithTickerId(tickerId: number) {
    callRustService("get_exchange_id_with_ticker_id", [tickerId]).then(
      customLogger.debug
    );
  }

  // TODO: Remove; just debugging; probably don't need to expose this
  PROTO_fetchSectorNameWithId(sectorId: number) {
    callRustService("get_sector_name_with_id", [sectorId]).then(
      customLogger.debug
    );
  }

  // TODO: Remove; just debugging; probably don't need to expose this
  PROTO_fetchIndustryNameWithId(industryId: number) {
    callRustService("get_industry_name_with_id", [industryId]).then(
      customLogger.debug
    );
  }

  PROTO_removeCacheEntry(key: string) {
    // TODO: Add rapid UI update
    callRustService("remove_cache_entry", [key]);
  }

  PROTO_clearCache() {
    // TODO: Add rapid UI update
    callRustService("clear_cache");
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
