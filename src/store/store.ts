// TODO: Add in session persistence so that portfolios and watchlists (`tickerBuckets`) can be saved.
// Ideally this should happen via the `SharedWorker` so that multiple tabs can retain the same store.

import {
  ReactStateEmitter,
  StateEmitterDefaultEvents,
} from "@utils/StateEmitter";
import callRustService, {
  subscribe as libRustServiceSubscribe,
  NotifierEvent,
} from "@utils/callRustService";
import type {
  RustServicePaginatedResults,
  RustServiceTickerSearchResult,
  RustServiceTickerDetail,
  RustServiceCacheDetail,
  RustServiceETFAggregateDetail,
  RustServiceImageInfo,
} from "@src/types";
import {
  XHROpenedRequests,
  CacheAccessedRequests,
} from "./OpenedNetworkRequests";

import detectHTMLJSVersionSync from "@utils/PROTO_detectHTMLJSVersionSync";
import customLogger from "@utils/customLogger";

import debounceWithKey from "@utils/debounceWithKey";

const IS_PROD = import.meta.env.PROD;

type SymbolBucketTicker = {
  tickerId: number;
  symbol: string;
  exchange_short_name: string;
  quantity: number;
};

export type SymbolBucketProps = {
  name: string;
  tickers: SymbolBucketTicker[];
  bucketType:
    | "watchlist"
    | "portfolio"
    | "ticker_tape"
    | "recently_viewed"
    | "attention_tracker";
  requiresQuantity: boolean;
  isUserConfigurable: boolean;
};

export const tickerBucketDefaultNames: Readonly<
  Record<SymbolBucketProps["bucketType"], string>
> = {
  watchlist: "Watchlist",
  portfolio: "Portfolio",
  ticker_tape: "Ticker Tape",
  recently_viewed: "Recently Viewed",
  attention_tracker: "Attention Tracker",
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
  visibleTickerIds: number[];
  isSearchModalOpen: boolean;
  tickerBuckets: SymbolBucketProps[]; // TODO: `tickerBuckets`
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
      visibleTickerIds: [],
      isSearchModalOpen: false,
      tickerBuckets: [
        {
          name: "My Portfolio",
          tickers: [],
          bucketType: "portfolio",
          requiresQuantity: true,
          isUserConfigurable: true,
        },
        {
          name: "My Watchlist",
          tickers: [],
          bucketType: "watchlist",
          requiresQuantity: false,
          isUserConfigurable: true,
        },
        {
          name: "My Ticker Tape",
          tickers: [],
          bucketType: "ticker_tape",
          requiresQuantity: false,
          isUserConfigurable: true,
        },
        {
          name: "My Recently Viewed",
          tickers: [],
          bucketType: "recently_viewed",
          requiresQuantity: false,
          isUserConfigurable: false,
        },
        // TODO: Infer potential ETFs that a user may be interested in based on searched
        // symbols and the frequency of the most common ETFs that hold those symbols
        {
          name: "My Attention Tracker",
          tickers: [],
          bucketType: "attention_tracker",
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

    // Note: This returns an unsubscribe callback which could be handed if the store
    // were to be torn down
    this._initLocalSubscription();

    // TODO: Poll for data build info once every "x" to ensure the data is always running the latest version
    this._fetchDataBuildInfo();

    // Make initial searches faster
    this._preloadTickerSearchCache();
  }

  private _initLocalSubscription(): () => void {
    const _handleOnlineStatus = () => {
      this.setState({ isOnline: Boolean(navigator.onLine) });
    };

    _handleOnlineStatus();

    window.addEventListener("online", _handleOnlineStatus);
    window.addEventListener("offline", _handleOnlineStatus);

    const _handleVisibleTickersUpdate = (keys: (keyof StoreStateProps)[]) => {
      if (keys.includes("visibleTickerIds")) {
        const { visibleTickerIds } = this.getState(["visibleTickerIds"]);

        // TODO: Handle this tracking
        customLogger.debug({ visibleTickerIds });
      }
    };
    this.on(StateEmitterDefaultEvents.UPDATE, _handleVisibleTickersUpdate);

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

        if (eventType === NotifierEvent.NETWORK_CACHE_ACCESSED) {
          // Signal open cache request (auto-closes)
          cacheAccessedRequests.add(pathName);
        }

        if (
          [
            NotifierEvent.NETWORK_CACHE_ENTRY_INSERTED,
            NotifierEvent.NETWORK_CACHE_ENTRY_REMOVED,
            NotifierEvent.NETWORK_CACHE_CLEARED,
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

      this.off(StateEmitterDefaultEvents.UPDATE, _handleVisibleTickersUpdate);
    };
  }

  setVisibleTickers(visibleTickerIds: number[]) {
    this.setState({ visibleTickerIds });
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

  private async _preloadTickerSearchCache() {
    return callRustService("preload_symbol_search_cache");
  }

  async searchTickers(
    query: string,
    page: number = 1,
    pageSize: number = 20,
    onlyExactMatches: boolean = false,
    abortSignal?: AbortSignal
  ): Promise<RustServicePaginatedResults<RustServiceTickerSearchResult>> {
    return callRustService<
      RustServicePaginatedResults<RustServiceTickerSearchResult>
    >(
      "search_tickers",
      [query.trim(), page, pageSize, onlyExactMatches],
      abortSignal
    );
  }

  async fetchETFHoldersAggregateDetailByTickerId(
    tickerId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<RustServicePaginatedResults<RustServiceETFAggregateDetail>> {
    return callRustService<
      RustServicePaginatedResults<RustServiceETFAggregateDetail>
    >("get_etf_holders_aggregate_detail_by_ticker_id", [
      tickerId,
      page,
      pageSize,
    ]);
  }

  async fetchTickerDetail(tickerId: number): Promise<RustServiceTickerDetail> {
    return callRustService<RustServiceTickerDetail>("get_ticker_detail", [
      tickerId,
    ]);
  }

  async fetchETFAggregateDetailByTickerId(
    etfTickerId: number
  ): Promise<RustServiceETFAggregateDetail> {
    return callRustService<RustServiceETFAggregateDetail>(
      "get_etf_aggregate_detail_by_ticker_id",
      [etfTickerId]
    );
  }

  fetchImageInfo(filename: string): Promise<RustServiceImageInfo> {
    return callRustService<RustServiceImageInfo>("get_image_info", [filename]);
  }

  async fetchSymbolAndExchangeByTickerId(
    tickerId: number
  ): Promise<[string, string]> {
    return callRustService("get_symbol_and_exchange_by_ticker_id", [tickerId]);
  }

  async addTickerToBucket(
    tickerId: number,
    quantity: number,
    tickerBucket: SymbolBucketProps
  ) {
    const tickerAndExchange = await this.fetchSymbolAndExchangeByTickerId(
      tickerId
    );

    const symbol = tickerAndExchange[0];
    const exchange_short_name = tickerAndExchange[1];

    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.map((bucket) => {
        if (bucket.name === tickerBucket.name) {
          return {
            ...bucket,
            tickers: Array.from(
              new Set([
                ...bucket.tickers,
                {
                  tickerId,
                  symbol,
                  exchange_short_name,
                  quantity,
                },
              ])
            ),
          };
        }
        return bucket;
      });
      return { tickerBuckets };
    });
  }

  // TODO: Remove `PROTO` prefix
  PROTO_removeCacheEntry(key: string) {
    // TODO: Add rapid UI update
    callRustService("remove_cache_entry", [key]);
  }

  // TODO: Remove `PROTO` prefix
  PROTO_clearCache() {
    // TODO: Add rapid UI update
    callRustService("clear_cache");
  }
}

const store = new _Store();

export default store;
