import {
  DEFAULT_TICKER_TAPE_TICKERS,
  MAX_RECENTLY_VIEWED_ITEMS,
} from "@src/constants";
import type {
  RustServiceCacheDetail,
  RustServiceDataBuildInfo,
  RustServiceETFAggregateDetail,
  RustServiceETFHoldingTickerResponse,
  RustServiceETFHoldingWeightResponse,
  RustServiceImageInfo,
  RustServicePaginatedResults,
  RustServiceTicker10KDetail,
  RustServiceTickerDetail,
  RustServiceTickerDistance,
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

export type TickerBucketTicker = {
  tickerId: number;
  symbol: string;
  exchange_short_name?: string;
  quantity: number;
};

export type TickerBucket = {
  name: string;
  tickers: TickerBucketTicker[];
  type: "watchlist" | "portfolio" | "ticker_tape" | "recently_viewed";
  description: string;
  isUserConfigurable: boolean;
  // TODO: Track bucket last update time
};

export const tickerBucketDefaultNames: Readonly<
  Record<TickerBucket["type"], string>
> = {
  watchlist: "Watchlist",
  portfolio: "Portfolio",
  ticker_tape: "Ticker Tape",
  recently_viewed: "Recently Viewed",
};

export const multiBucketInstancesAllowed: Readonly<TickerBucket["type"][]> = [
  "watchlist",
  "portfolio",
];

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
  tickerBuckets: TickerBucket[];
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
  tickerBuckets: TickerBucket[];
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
    this._syncDataBuildInfo();

    // Make initial searches faster
    this._preloadTickerSearchCache();

    this._indexedDBInterface = new IndexedDBInterface();

    // Note: This returns an unsubscribe callback which could be handed if the store
    // were to be torn down
    this._initLocalSubscriptions();
  }

  // Note: This should be called immediately after the `IndexedDBInterface` has been
  // initialized (or fails), not directly from the constructor.
  private async _initInitialTickerTapeTickers() {
    const tickerTapeBucket = this.getFirstTickerBucketOfType("ticker_tape");

    if (!tickerTapeBucket) {
      return;
    }

    if (tickerTapeBucket.tickers.length) {
      customLogger.debug(
        "Skipping default ticker tape bucket assignment. Using user-defined configuration:",
        tickerTapeBucket.tickers,
      );
      return;
    }

    const results = await Promise.allSettled(
      DEFAULT_TICKER_TAPE_TICKERS.map((ticker) =>
        this.fetchTickerId(ticker.symbol, ticker.exchangeShortName),
      ),
    );

    const tickerTapeBucketTickers: TickerBucketTicker[] = results
      .filter((result) => result.status === "fulfilled")
      .map((result, index) => {
        const fulfilledResult = result as PromiseFulfilledResult<number>;
        return {
          tickerId: fulfilledResult.value,
          symbol: DEFAULT_TICKER_TAPE_TICKERS[index].symbol,
          exchange_short_name:
            DEFAULT_TICKER_TAPE_TICKERS[index].exchangeShortName,
          quantity: 1,
        };
      });

    this.updateTickerBucket(tickerTapeBucket, {
      ...tickerTapeBucket,
      tickers: tickerTapeBucketTickers,
    });
  }

  // Note: Shared session management is handled via `SharedSessionManagerProvider`
  // and works in conjunction with the IndexedDB and Rust service ticker state,
  // as handled within this method.
  private _initLocalSubscriptions() {
    this._initOnlineStatusListener();
    this._initTickerViewTracking();
    this._initNetworkRequestTracking();
    this._initIndexedDBPersistence();
  }

  // Handles online/offline status updates
  private _initOnlineStatusListener() {
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
  }

  // Handles the tracking of ticker views and syncing with Rust service
  private _initTickerViewTracking() {
    const _handleVisibleTickersUpdate = (keys: (keyof StoreStateProps)[]) => {
      if (keys.includes("visibleTickerIds")) {
        const { visibleTickerIds } = this.getState(["visibleTickerIds"]);

        if (visibleTickerIds.length) {
          this._addRecentlyViewedTicker(visibleTickerIds[0]);
        }
      }
    };

    this.on(StateEmitterDefaultEvents.UPDATE, _handleVisibleTickersUpdate);

    this.registerDispose(() => {
      this.off(StateEmitterDefaultEvents.UPDATE, _handleVisibleTickersUpdate);
    });
  }

  // Handles network request tracking and synchronization
  private _initNetworkRequestTracking() {
    const { xhrOpenedRequests, cacheAccessedRequests } =
      this._setupNetworkRequestTrackers();

    // Subscribe to Rust-service notification events
    const libRustServiceUnsubscribe = libRustServiceSubscribe(
      (eventType: NotifierEvent, args: unknown[]) => {
        const pathName: string = args[0] as string;

        switch (eventType) {
          case NotifierEvent.XHR_REQUEST_CREATED:
            xhrOpenedRequests.add(pathName);
            break;
          case NotifierEvent.XHR_REQUEST_ERROR:
            xhrOpenedRequests.delete(pathName);
            this._handleXHRError(pathName);
            break;
          case NotifierEvent.XHR_REQUEST_SENT:
            xhrOpenedRequests.delete(pathName);
            this._clearXHRError(pathName);
            break;
          case NotifierEvent.NETWORK_CACHE_ACCESSED:
            cacheAccessedRequests.add(pathName);
            break;
          case NotifierEvent.NETWORK_CACHE_ENTRY_INSERTED:
          case NotifierEvent.NETWORK_CACHE_ENTRY_REMOVED:
          case NotifierEvent.NETWORK_CACHE_CLEARED:
            debounceWithKey(
              "store:cache_profiler",
              () => this._syncCacheDetails(),
              this.state.cacheProfilerWaitTime,
            );
            break;
        }
      },
    );

    this.registerDispose(libRustServiceUnsubscribe);
  }

  // Setups up network request tracking for XHR and Cache
  private _setupNetworkRequestTrackers() {
    const xhrOpenedRequests = new XHROpenedRequests();
    const cacheAccessedRequests = new CacheAccessedRequests();

    xhrOpenedRequests.emitter.on(
      XHROpenedRequests.PATH_OPENED,
      (pathName: string) => {
        this.setState({ latestXHROpenedRequestPathName: pathName });
      },
    );

    xhrOpenedRequests.emitter.on(
      XHROpenedRequests.PATH_CLOSED,
      (pathName: string) => {
        if (this.state.latestXHROpenedRequestPathName === pathName) {
          this.setState({ latestXHROpenedRequestPathName: null });
        }
      },
    );

    cacheAccessedRequests.emitter.on(
      CacheAccessedRequests.PATH_OPENED,
      (pathName: string) => {
        this.setState({ latestCacheOpenedRequestPathName: pathName });
      },
    );

    cacheAccessedRequests.emitter.on(
      CacheAccessedRequests.PATH_CLOSED,
      (pathName: string) => {
        if (this.state.latestCacheOpenedRequestPathName === pathName) {
          this.setState({ latestCacheOpenedRequestPathName: null });
        }
      },
    );

    return { xhrOpenedRequests, cacheAccessedRequests };
  }

  private _handleXHRError(pathName: string) {
    const xhrRequestErrors = {
      ...this.state.rustServiceXHRRequestErrors,
      [pathName]: {
        errCount: this.state.rustServiceXHRRequestErrors[pathName]?.errCount
          ? this.state.rustServiceXHRRequestErrors[pathName]?.errCount + 1
          : 1,
        lastTimestamp: new Date().toISOString(),
      },
    };
    this.setState({ rustServiceXHRRequestErrors: xhrRequestErrors });
  }

  private _clearXHRError(pathName: string) {
    if (pathName in this.state.rustServiceXHRRequestErrors) {
      const next = { ...this.state.rustServiceXHRRequestErrors };
      delete next[pathName];
      this.setState({ rustServiceXHRRequestErrors: next });
    }
  }

  // Handles IndexedDB persistence and session restore
  private async _initIndexedDBPersistence() {
    try {
      await this._indexedDBInterface.ready();
      this.setState({ isIndexedDBReady: true });

      await this._restorePersistentSession();
    } finally {
      this._initInitialTickerTapeTickers();
    }
  }

  // Restores the persistent session from IndexedDB
  private async _restorePersistentSession() {
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

    this.emit("persistent-session-restore");

    this._subscribeToStateUpdatesForPersistence();
  }

  // Subscribes to state updates for persistence in IndexedDB
  private _subscribeToStateUpdatesForPersistence() {
    const _handleStoreStateUpdate = (
      storeStateUpdateKeys: (keyof StoreStateProps)[],
    ) => {
      if (storeStateUpdateKeys.includes("tickerBuckets")) {
        const { tickerBuckets } = this.getState(["tickerBuckets"]);
        this._indexedDBInterface.setItem("tickerBuckets", tickerBuckets);
      }

      if (storeStateUpdateKeys.includes("subscribedMQTTRoomNames")) {
        const { subscribedMQTTRoomNames } = this.getState([
          "subscribedMQTTRoomNames",
        ]);
        this._indexedDBInterface.setItem(
          "subscribedMQTTRoomNames",
          subscribedMQTTRoomNames,
        );
      }
    };
    this.on(StateEmitterDefaultEvents.UPDATE, _handleStoreStateUpdate);

    this.registerDispose(() => {
      this.off(StateEmitterDefaultEvents.UPDATE, _handleStoreStateUpdate);
    });
  }

  async fetchTickerId(
    tickerSymbol: string,
    exchangeShortName: string,
  ): Promise<number> {
    return callRustService<number>("get_ticker_id", [
      tickerSymbol,
      exchangeShortName,
    ]);
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

  private _syncDataBuildInfo(): void {
    callRustService<RustServiceDataBuildInfo>("get_data_build_info").then(
      (dataBuildInfo) => {
        this.setState({
          isRustInit: true,
          // TODO: If data build time is already set as state, but this indicates otherwise, that's a signal the app needs to update
          dataBuildTime: dataBuildInfo.time,
        });
      },
    );
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
  }: Omit<TickerBucket, "tickers">) {
    const nextBucket: TickerBucket = {
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

  updateTickerBucket(prevBucket: TickerBucket, updatedBucket: TickerBucket) {
    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.map((bucket) =>
        bucket.name === prevBucket.name && bucket.type === prevBucket.type
          ? { ...bucket, ...updatedBucket }
          : bucket,
      );

      return { tickerBuckets };
    });

    // TODO: Emit custom event for this to route to UI notification
  }

  deleteTickerBucket(tickerBucket: TickerBucket) {
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

    // TODO: Emit custom event for this to route to UI notification
  }
  async addTickerToBucket(
    tickerId: number,
    quantity: number,
    tickerBucket: TickerBucket,
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
                // Intentionally prepend
                {
                  tickerId,
                  symbol,
                  exchange_short_name,
                  quantity,
                },
                ...bucket.tickers,
              ]),
            ),
          };
        }
        return bucket;
      });
      return { tickerBuckets };
    });

    // TODO: Emit custom event for this to route to UI notification
  }

  removeTickerFromBucket(tickerId: number, tickerBucket: TickerBucket) {
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

    // TODO: Emit custom event for this to route to UI notification
  }

  bucketHasTicker(tickerId: number, tickerBucket: TickerBucket): boolean {
    return tickerBucket.tickers.some((ticker) => ticker.tickerId === tickerId);
  }

  bucketTypeHasTicker(
    tickerId: number,
    tickerBucketType: TickerBucket["type"],
  ): boolean {
    return this.state.tickerBuckets
      .filter((bucket) => bucket.type === tickerBucketType)
      .some((bucket) =>
        bucket.tickers.some((ticker) => ticker.tickerId === tickerId),
      );
  }

  getTickerBucketsOfType(
    tickerBucketType: TickerBucket["type"],
  ): TickerBucket[] {
    return this.state.tickerBuckets.filter(
      ({ type }) => tickerBucketType === type,
    );
  }

  private async _addRecentlyViewedTicker(tickerId: number) {
    const tickerDetail = await this.fetchTickerDetail(tickerId);
    const tickerBucketTicker: TickerBucketTicker = {
      tickerId,
      symbol: tickerDetail.symbol,
      exchange_short_name: tickerDetail.exchange_short_name,
      quantity: 1,
    };

    const recentlyViewedBucket =
      this.getFirstTickerBucketOfType("recently_viewed");

    if (!recentlyViewedBucket) {
      customLogger.warn("No recently viewed bucket");

      return;
    }

    // Filter out any existing ticker with the same tickerId, then prepend the new one
    const updatedTickers = [
      tickerBucketTicker,
      ...recentlyViewedBucket.tickers.filter(
        (ticker) => ticker.tickerId !== tickerId,
      ),
    ].slice(0, MAX_RECENTLY_VIEWED_ITEMS);

    this.updateTickerBucket(recentlyViewedBucket, {
      ...recentlyViewedBucket,
      tickers: updatedTickers,
    });
  }

  getFirstTickerBucketOfType(
    tickerBucketType: TickerBucket["type"],
  ): TickerBucket | void {
    const tickerBucketsOfType = this.getTickerBucketsOfType(tickerBucketType);

    if (tickerBucketsOfType.length) {
      return tickerBucketsOfType[0];
    }
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

  async removeCacheEntry(key: string): Promise<void> {
    await callRustService("remove_cache_entry", [key]);

    // For rapid UI update
    // This forces an immediate sync so that the UI does not appear laggy when clearing cache entries
    this._syncCacheDetails();
  }

  async clearCache() {
    callRustService("clear_cache");

    // For rapid UI update
    // This forces an immediate sync so that the UI does not appear laggy when clearing cache entries
    this._syncCacheDetails();
  }

  reset() {
    const clearPromises = [];

    // Wipe IndexedDB store
    if (this._indexedDBInterface) {
      clearPromises.push(this._indexedDBInterface.clear());
    }

    // Clear the cache
    clearPromises.push(this.clearCache());

    super.reset();

    Promise.all(clearPromises).finally(() => {
      // This prevents an issue where the UI might be in a non-recoverable state after resetting the store
      window.location.reload();
    });
  }

  /// TODO: Refactor as needed

  async fetchClosestTickers(
    tickerId: number,
  ): Promise<RustServiceTickerDistance[]> {
    return callRustService<RustServiceTickerDistance[]>(
      "find_closest_tickers",
      [tickerId],
    ).then((data) => {
      customLogger.debug({ data });

      // TODO: Remove; also include these with the Rust response in the API call
      const detailPromises = data.map((item) =>
        this.fetchTickerDetail(item.ticker_id),
      );
      Promise.allSettled(detailPromises).then(customLogger.debug);

      return data;
    });
  }
}

const store = new _Store();

export default store;
export { StateEmitterDefaultEvents };
