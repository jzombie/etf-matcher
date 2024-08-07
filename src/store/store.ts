// TODO: Add in session persistence so that portfolios and watchlists (`tickerBuckets`) can be saved.
// Ideally this should happen via the `SharedWorker` so that multiple tabs can retain the same store.
import type {
  RustServiceCacheDetail,
  RustServiceETFAggregateDetail,
  RustServiceETFHoldingTickerResponse,
  RustServiceETFHoldingWeightResponse,
  RustServiceImageInfo,
  RustServicePaginatedResults,
  RustServiceTicker10KDetail,
  RustServiceTickerDetail,
  RustServiceTickerSearchResult,
} from "@src/types";

import IndexedDBInterface from "@utils/IndexedDBInterface";
import MQTTRoom from "@utils/MQTTRoom";
import detectHTMLJSVersionSync from "@utils/PROTO_detectHTMLJSVersionSync";
import {
  ReactStateEmitter,
  StateEmitterDefaultEvents,
} from "@utils/StateEmitter";
import callRustService, {
  NotifierEvent,
  subscribe as libRustServiceSubscribe,
} from "@utils/callRustService";
import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";

import {
  CacheAccessedRequests,
  XHROpenedRequests,
} from "./OpenedNetworkRequests";

const IS_PROD = import.meta.env.PROD;

type TickerBucketTicker = {
  tickerId: number;
  symbol: string;
  exchange_short_name: string;
  quantity: number;
};

export type TickerBucketProps = {
  name: string;
  tickers: TickerBucketTicker[];
  type:
    | "watchlist"
    | "portfolio"
    | "ticker_tape"
    | "recently_viewed"
    | "attention_tracker";
  description: string;
  isUserConfigurable: boolean;
};

export const tickerBucketDefaultNames: Readonly<
  Record<TickerBucketProps["type"], string>
> = {
  watchlist: "Watchlist",
  portfolio: "Portfolio",
  ticker_tape: "Ticker Tape",
  recently_viewed: "Recently Viewed",
  attention_tracker: "Attention Tracker",
};

export type StoreStateProps = {
  isHTMLJSVersionSynced: boolean;
  isIndexedDBReady: boolean;
  isAppUnlocked: boolean;
  isGAPageTrackingEnabled: boolean;
  isProductionBuild: boolean;
  isOnline: boolean;
  isRustInit: boolean;
  dataBuildTime: string | null;
  isDirtyState: boolean;
  visibleTickerIds: number[];
  isSearchModalOpen: boolean;
  tickerBuckets: TickerBucketProps[];
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
  subscribedMQTTRoomNames: string[];
};

export type IndexedDBPersistenceProps = {
  tickerBuckets: TickerBucketProps[];
  subscribedMQTTRoomNames: string[];
};

class _Store extends ReactStateEmitter<StoreStateProps> {
  private _indexedDBInterface: IndexedDBInterface<IndexedDBPersistenceProps>;

  constructor() {
    // TODO: Catch worker function errors and log them to the state so they can be piped up to the UI
    super({
      isHTMLJSVersionSynced: detectHTMLJSVersionSync(),
      isIndexedDBReady: false,
      isAppUnlocked: false,
      isGAPageTrackingEnabled: false,
      isProductionBuild: IS_PROD,
      isOnline: false,
      isRustInit: false,
      dataBuildTime: null,
      isDirtyState: false,
      visibleTickerIds: [],
      isSearchModalOpen: false,
      tickerBuckets: [
        {
          name: "My Portfolio",
          tickers: [],
          type: "portfolio",
          description: "Default portfolio",
          isUserConfigurable: true,
        },
        {
          name: "My Watchlist",
          tickers: [],
          type: "watchlist",
          description: "Default watchlist",
          isUserConfigurable: true,
        },
        {
          name: "My Ticker Tape",
          tickers: [],
          type: "ticker_tape",
          description: "Ticker tape",
          isUserConfigurable: true,
        },
        {
          name: "My Recently Viewed",
          tickers: [],
          type: "recently_viewed",
          description: "Recently viewed tickers",
          isUserConfigurable: false,
        },
        // TODO: Infer potential ETFs that a user may be interested in based on searched
        // symbols and the frequency of the most common ETFs that hold those symbols
        {
          name: "My Attention Tracker",
          tickers: [],
          type: "attention_tracker",
          description: "For suggestions",
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
      subscribedMQTTRoomNames: [],
    });

    // Only deepfreeze in development
    this.shouldDeepfreeze = !IS_PROD;

    // TODO: Poll for data build info once every "x" to ensure the data is always running the latest version
    this._fetchDataBuildInfo();

    // Make initial searches faster
    this._preloadTickerSearchCache();

    this._indexedDBInterface = new IndexedDBInterface();

    // Note: This returns an unsubscribe callback which could be handed if the store
    // were to be torn down
    this._initLocalSubscriptions();
  }

  private _initLocalSubscriptions() {
    (() => {
      const _handleOnlineStatus = () => {
        this.setState({ isOnline: Boolean(navigator.onLine) });
      };
      _handleOnlineStatus();

      window.addEventListener("online", _handleOnlineStatus);
      window.addEventListener("offline", _handleOnlineStatus);

      this.registerDispose(() => {
        window.removeEventListener("online", _handleOnlineStatus);
        window.removeEventListener("offline", _handleOnlineStatus);
      });
    })();

    (() => {
      const _handleVisibleTickersUpdate = (keys: (keyof StoreStateProps)[]) => {
        if (keys.includes("visibleTickerIds")) {
          const { visibleTickerIds } = this.getState(["visibleTickerIds"]);

          // TODO: Handle this tracking
          // customLogger.debug({ visibleTickerIds });
        }
      };
      this.on(StateEmitterDefaultEvents.UPDATE, _handleVisibleTickersUpdate);

      this.registerDispose(() => {
        this.off(StateEmitterDefaultEvents.UPDATE, _handleVisibleTickersUpdate);
      });
    })();

    (() => {
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
          },
        );

        xhrOpenedRequests.emitter.on(
          XHROpenedRequests.PATH_CLOSED,
          (pathName: string) => {
            if (this.state.latestXHROpenedRequestPathName === pathName) {
              this.setState({
                latestXHROpenedRequestPathName: null,
              });
            }
          },
        );

        cacheAccessedRequests.emitter.on(
          CacheAccessedRequests.PATH_OPENED,
          (pathName: string) => {
            this.setState({
              latestCacheOpenedRequestPathName: pathName,
            });
          },
        );

        cacheAccessedRequests.emitter.on(
          CacheAccessedRequests.PATH_CLOSED,
          (pathName: string) => {
            if (this.state.latestCacheOpenedRequestPathName === pathName) {
              this.setState({
                latestCacheOpenedRequestPathName: null,
              });
            }
          },
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
                  ? this.state.rustServiceXHRRequestErrors[pathName]?.errCount +
                    1
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
                this._syncCacheDetails();
              },
              this.state.cacheProfilerWaitTime,
            );
          }
        },
      );

      this.registerDispose(libRustServiceUnsubscribe);
    })();

    // IndexedDB persistence
    (async () => {
      await this._indexedDBInterface.ready();

      this.setState({ isIndexedDBReady: true });

      // Handle session restore
      (async () => {
        const indexedDBKeys = await this._indexedDBInterface.getAllKeys();

        const storeStateKeys = Object.keys(this.state) as Array<
          keyof StoreStateProps
        >;

        for (const idbKey of indexedDBKeys) {
          if (storeStateKeys.includes(idbKey as keyof StoreStateProps)) {
            const item = await this._indexedDBInterface.getItem(idbKey);
            if (item !== undefined) {
              this.setState({ [idbKey]: item });
            }
          }
        }

        // Emit that session is now ready
        this.emit("persistent-session-restore");
      })();

      (() => {
        const _handleStoreStateUpdate = async (
          storeStateUpdateKeys: (keyof StoreStateProps)[],
        ) => {
          if (storeStateUpdateKeys.includes("tickerBuckets")) {
            const { tickerBuckets } = this.getState(["tickerBuckets"]);

            await this._indexedDBInterface.setItem(
              "tickerBuckets",
              tickerBuckets,
            );
          }

          if (storeStateUpdateKeys.includes("subscribedMQTTRoomNames")) {
            const { subscribedMQTTRoomNames } = this.getState([
              "subscribedMQTTRoomNames",
            ]);

            await this._indexedDBInterface.setItem(
              "subscribedMQTTRoomNames",
              subscribedMQTTRoomNames,
            );
          }
        };
        this.on(StateEmitterDefaultEvents.UPDATE, _handleStoreStateUpdate);

        this.registerDispose(() => {
          this.off(StateEmitterDefaultEvents.UPDATE, _handleStoreStateUpdate);
        });
      })();
    })();
  }

  /**
   * Invoked by the `MultiMQTTRoomProvider` to update state of currently subscribed rooms.
   */
  addMQTTRoomSubscription(room: MQTTRoom) {
    this.setState((prev) => ({
      subscribedMQTTRoomNames: [
        ...new Set([...prev.subscribedMQTTRoomNames, room.roomName]),
      ],
    }));
  }

  /**
   * Invoked by the `MultiMQTTRoomProvider` to update state of currently subscribed rooms.
   */
  removeMQTTRoomSubscription(room: MQTTRoom) {
    this.setState((prev) => ({
      subscribedMQTTRoomNames: prev.subscribedMQTTRoomNames.filter(
        (roomName) => roomName !== room.roomName,
      ),
    }));
  }

  setVisibleTickers(visibleTickerIds: number[]) {
    this.setState({ visibleTickerIds });
  }

  private async _syncCacheDetails(): Promise<void> {
    callRustService<number>("get_cache_size").then((cacheSize) => {
      this.setState({ cacheSize });
    });
    callRustService<RustServiceCacheDetail[]>("get_cache_details").then(
      (cacheDetails) => this.setState({ cacheDetails }),
    );
  }

  private _fetchDataBuildInfo() {
    callRustService("get_data_build_info").then((dataBuildInfo) => {
      this.setState({
        isRustInit: true,
        // TODO: If data build time is already set as state, but this indicates otherwise, that's a signal the app needs to update
        dataBuildTime: (dataBuildInfo as { [key: string]: string }).time,
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
    abortSignal?: AbortSignal,
  ): Promise<RustServicePaginatedResults<RustServiceTickerSearchResult>> {
    return callRustService<
      RustServicePaginatedResults<RustServiceTickerSearchResult>
    >(
      "search_tickers",
      [query.trim(), page, pageSize, onlyExactMatches],
      abortSignal,
    );
  }

  async fetchETFHoldersAggregateDetailByTickerId(
    tickerId: number,
    page: number = 1,
    pageSize: number = 20,
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

  async fetchTicker10KDetail(
    tickerId: number,
  ): Promise<RustServiceTicker10KDetail> {
    return callRustService<RustServiceTicker10KDetail>(
      "get_ticker_10k_detail",
      [tickerId],
    );
  }

  async fetchETFAggregateDetailByTickerId(
    etfTickerId: number,
  ): Promise<RustServiceETFAggregateDetail> {
    return callRustService<RustServiceETFAggregateDetail>(
      "get_etf_aggregate_detail_by_ticker_id",
      [etfTickerId],
    );
  }

  async fetchImageInfo(filename: string): Promise<RustServiceImageInfo> {
    return callRustService<RustServiceImageInfo>("get_image_info", [filename]);
  }

  async fetchSymbolAndExchangeByTickerId(
    tickerId: number,
  ): Promise<[string, string]> {
    return callRustService("get_symbol_and_exchange_by_ticker_id", [tickerId]);
  }

  createTickerBucket({
    name,
    type,
    description,
    isUserConfigurable,
  }: Omit<TickerBucketProps, "tickers">) {
    const nextBucket: TickerBucketProps = {
      name,
      tickers: [],
      type,
      description,
      isUserConfigurable,
    };

    // TODO: Prevent bucket from being added if of same name and type

    this.setState((prev) => ({
      tickerBuckets: [nextBucket, ...prev.tickerBuckets],
    }));
  }

  updateTickerBucket(
    prevBucket: TickerBucketProps,
    updatedBucket: TickerBucketProps,
  ) {
    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.map((bucket) =>
        bucket.name === prevBucket.name && bucket.type === prevBucket.type
          ? { ...bucket, ...updatedBucket }
          : bucket,
      );

      return { tickerBuckets };
    });

    // TODO: Emit custom event for this
  }

  deleteTickerBucket(tickerBucket: TickerBucketProps) {
    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.filter(
        (cachedBucket) =>
          !(
            cachedBucket.name === tickerBucket.name &&
            cachedBucket.type === tickerBucket.type
          ),
      );
      return { tickerBuckets };
    });

    // TODO: Emit custom event for this
  }
  async addTickerToBucket(
    tickerId: number,
    quantity: number,
    tickerBucket: TickerBucketProps,
  ) {
    const tickerAndExchange =
      await this.fetchSymbolAndExchangeByTickerId(tickerId);

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
              ]),
            ),
          };
        }
        return bucket;
      });
      return { tickerBuckets };
    });

    // TODO: Emit custom event for this
  }

  removeTickerFromBucket(tickerId: number, tickerBucket: TickerBucketProps) {
    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.map((bucket) => {
        if (bucket.name === tickerBucket.name) {
          return {
            ...bucket,
            tickers: bucket.tickers.filter(
              (ticker) => ticker.tickerId !== tickerId,
            ),
          };
        }
        return bucket;
      });
      return { tickerBuckets };
    });

    // TODO: Emit custom event for this
  }

  bucketHasTicker(tickerId: number, tickerBucket: TickerBucketProps): boolean {
    return tickerBucket.tickers.some((ticker) => ticker.tickerId === tickerId);
  }

  async generateQRCode(data: string): Promise<string> {
    return callRustService<string>("generate_qr_code", [data]);
  }

  async fetchETFHoldingsByETFTickerId(
    tickerId: number,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<RustServicePaginatedResults<RustServiceETFHoldingTickerResponse>> {
    return callRustService<
      RustServicePaginatedResults<RustServiceETFHoldingTickerResponse>
    >("get_etf_holdings_by_etf_ticker_id", [tickerId, page, pageSize]);
  }

  async fetchETFHoldingWeight(
    etfTickerId: number,
    holdingTickerId: number,
  ): Promise<RustServiceETFHoldingWeightResponse> {
    return callRustService<RustServiceETFHoldingWeightResponse>(
      "get_etf_holding_weight",
      [etfTickerId, holdingTickerId],
    );
  }

  removeCacheEntry(key: string) {
    callRustService("remove_cache_entry", [key]);

    // For rapid UI update
    // This forces an immediate sync so that the UI does not appear laggy when clearing cache entries
    this._syncCacheDetails();
  }

  clearCache() {
    callRustService("clear_cache");

    // For rapid UI update
    // This forces an immediate sync so that the UI does not appear laggy when clearing cache entries
    this._syncCacheDetails();
  }

  reset() {
    // TODO: Wipe IndexedDB store

    this.clearCache();
    super.reset();

    // This prevents an issue where the UI might be in a non-recoverable state after resetting the store
    // TODO: Reload asynchronously, only after caches have successfully cleared
    window.location.reload();
  }
}

const store = new _Store();

export default store;
export { StateEmitterDefaultEvents };
