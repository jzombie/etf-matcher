import IndexedDBService from "@services/IndexedDBService";
import MultiMQTTRoomService, { MQTTRoom } from "@services/MultiMQTTRoomService";
import type { RustServiceCacheDetail } from "@services/RustService";
import {
  NotifierEvent,
  clearCache,
  fetchCacheDetails,
  fetchCacheSize,
  fetchDataBuildInfo,
  fetchSymbolAndExchange,
  fetchTickerDetail,
  fetchTickerId,
  subscribe as libRustServiceSubscribe,
  preloadSearchCache,
  removeCacheEntry,
} from "@services/RustService";
import TickerBucketImportExportService from "@services/TickerBucketImportExportService";
import {
  DEFAULT_TICKER_TAPE_TICKERS,
  DEFAULT_TICKER_VECTOR_CONFIG_KEY,
  INDEXED_DB_PERSISTENCE_KEYS,
  MAX_RECENTLY_VIEWED_ITEMS,
  MIN_TICKER_BUCKET_NAME_LENGTH,
} from "@src/constants";
import type { AppThemeFontMode } from "@src/theme";
import { v4 as uuidv4 } from "uuid";

import {
  ReactStateEmitter,
  StateEmitterDefaultEvents,
} from "@utils/StateEmitter";
import arraysEqual from "@utils/arraysEqual";
import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";
import detectHTMLJSVersionSync from "@utils/detectHTMLJSVersionSync";
import getIsProdEnv from "@utils/getIsProdEnv";

import {
  CacheAccessedRequests,
  XHROpenedRequests,
} from "./OpenedNetworkRequests";

export type TickerBucketTicker = {
  tickerId: number;
  symbol: string;
  exchangeShortName?: string;
  quantity: number;
};

export type TickerBucket = {
  uuid: string;
  name: string;
  tickers: TickerBucketTicker[];
  type: "watchlist" | "portfolio" | "ticker_tape" | "recently_viewed";
  description: string;
  isUserConfigurable: boolean;
  // TODO: Track bucket last update time
};

export class TickerBucketNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TickerBucketNameError";
  }
}

export const tickerBucketDefaultNames: Readonly<
  Record<TickerBucket["type"], string>
> = {
  watchlist: "Watchlist",
  portfolio: "Portfolio",
  ticker_tape: "Ticker Tape",
  recently_viewed: "Recently Viewed",
};

// The ticker bucket types which allow multiple instances
export const multiBucketInstancesAllowed: Readonly<TickerBucket["type"][]> = [
  "watchlist",
  "portfolio",
];

const DEFAULT_TICKER_BUCKETS: TickerBucket[] = [
  // Note: The following `UUID`s are created at each store initialization,
  // but are replaced if an existing session has loaded via IndexedDB.
  // See: `_restorePersistentSession` in this class.
  {
    uuid: uuidv4(),
    name: "My Portfolio",
    tickers: [],
    type: "portfolio",
    description: "Default portfolio",
    isUserConfigurable: true,
  },
  {
    uuid: uuidv4(),
    name: "My Watchlist",
    tickers: [],
    type: "watchlist",
    description: "Default watchlist",
    isUserConfigurable: true,
  },
  {
    uuid: uuidv4(),
    name: "My Ticker Tape",
    tickers: [],
    type: "ticker_tape",
    description: "Ticker tape",
    isUserConfigurable: true,
  },
  {
    uuid: uuidv4(),
    name: "My Recently Viewed",
    tickers: [],
    type: "recently_viewed",
    description: "Recently viewed tickers",
    isUserConfigurable: false,
  },
];

export type StoreStateProps = {
  appThemeProps: {
    fontMode: AppThemeFontMode;
  };
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
  uiErrors: Error[];
  preferredTickerVectorConfigKey: string;
};

export type IndexedDBPersistenceProps = {
  [K in (typeof INDEXED_DB_PERSISTENCE_KEYS)[number]]: StoreStateProps[K];
};

// TODO: Determine exportable props for MultiMQTTRoomService (similar to IndexedDBPersistenceProps)

class Store extends ReactStateEmitter<StoreStateProps> {
  private _indexedDBService: IndexedDBService<IndexedDBPersistenceProps>;
  private _multiMQTTRoomService: MultiMQTTRoomService;
  private _tickerBucketImportExportService: TickerBucketImportExportService;

  private static _instance: Store;

  constructor() {
    if (Store._instance) {
      throw new Error(
        "Store instance already created. Use the existing instance.",
      );
    }

    // TODO: Catch worker function errors and log them to the state so they can be piped up to the UI
    super({
      appThemeProps: {
        fontMode: "normal",
      },
      isHTMLJSVersionSynced: detectHTMLJSVersionSync(),
      isIndexedDBReady: false,
      isAppUnlocked: false,
      isGAPageTrackingEnabled: false,
      isProductionBuild: getIsProdEnv(),
      isOnline: false,
      isRustInit: false,
      dataBuildTime: null,
      isDirtyState: false,
      visibleTickerIds: [],
      isSearchModalOpen: false,
      tickerBuckets: DEFAULT_TICKER_BUCKETS,
      isProfilingCacheOverlayOpen: false,
      cacheProfilerWaitTime: 500,
      cacheDetails: [],
      cacheSize: 0,
      rustServiceXHRRequestErrors: {},
      latestXHROpenedRequestPathName: null,
      latestCacheOpenedRequestPathName: null,
      subscribedMQTTRoomNames: [],
      uiErrors: [],
      preferredTickerVectorConfigKey: DEFAULT_TICKER_VECTOR_CONFIG_KEY,
    });

    Store._instance = this;

    // TODO: Poll for data build info once every "x" to ensure the data is always running the latest version
    this._syncDataBuildInfo();

    // Make initial searches faster
    preloadSearchCache();

    // FIXME: In the future, these could be `registerService` methods
    this._indexedDBService = new IndexedDBService(this);
    this._multiMQTTRoomService = new MultiMQTTRoomService(this);
    this._tickerBucketImportExportService = new TickerBucketImportExportService(
      this,
    );
    // Note: This returns an unsubscribe callback which could be handed if the store
    // were to be torn down
    this._initLocalSubscriptions();
  }

  get multiMQTTRoomService(): MultiMQTTRoomService {
    return this._multiMQTTRoomService;
  }

  get tickerBucketImportExportService(): TickerBucketImportExportService {
    return this._tickerBucketImportExportService;
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
        fetchTickerId(ticker.symbol, ticker.exchangeShortName),
      ),
    );

    const tickerTapeBucketTickers: TickerBucketTicker[] = results
      .filter((result) => result.status === "fulfilled")
      .map((result, index) => {
        const fulfilledResult = result as PromiseFulfilledResult<number>;
        return {
          tickerId: fulfilledResult.value,
          symbol: DEFAULT_TICKER_TAPE_TICKERS[index].symbol,
          exchangeShortName:
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
    const _onOnlineStatus = () => {
      this.setState({ isOnline: Boolean(navigator.onLine) });
    };
    _onOnlineStatus();

    window.addEventListener("online", _onOnlineStatus);
    window.addEventListener("offline", _onOnlineStatus);

    this.registerDisposeFunction(() => {
      window.removeEventListener("online", _onOnlineStatus);
      window.removeEventListener("offline", _onOnlineStatus);
    });
  }

  // Handles the tracking of ticker views and syncing with Rust service
  private _initTickerViewTracking() {
    const _onVisibleTickersUpdate = (keys: (keyof StoreStateProps)[]) => {
      if (keys.includes("visibleTickerIds")) {
        const { visibleTickerIds } = this.getState(["visibleTickerIds"]);

        if (visibleTickerIds.length) {
          this._addRecentlyViewedTicker(visibleTickerIds[0]);
        }
      }
    };

    this.on(StateEmitterDefaultEvents.UPDATE, _onVisibleTickersUpdate);

    this.registerDisposeFunction(() => {
      this.off(StateEmitterDefaultEvents.UPDATE, _onVisibleTickersUpdate);
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
            this._onXHRError(pathName);
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

    this.registerDisposeFunction(libRustServiceUnsubscribe);
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

  private _onXHRError(pathName: string) {
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
      await this._indexedDBService.ready();
      await this._restorePersistentSession();

      // Signal it is `ready` *after* restoring the persistent session
      this.setState({ isIndexedDBReady: true });
    } finally {
      this._initInitialTickerTapeTickers();
    }
  }

  // Restores the persistent session from IndexedDB
  private async _restorePersistentSession() {
    const indexedDBKeys = await this._indexedDBService.getAllKeys();
    const storeStateKeys = Object.keys(this.state) as Array<
      keyof StoreStateProps
    >;

    for (const idbKey of indexedDBKeys) {
      if (storeStateKeys.includes(idbKey as keyof StoreStateProps)) {
        const item = await this._indexedDBService.getItem(idbKey);
        if (item !== undefined) {
          // TODO: Performance could be improved here by not setting state for
          // each key, and using a single batch update instead
          this.setState({ [idbKey]: item });
        }
      }
    }

    // Connect to subscribed MQTT rooms
    this._multiMQTTRoomService.connectToDisconnectedSubscribedRooms();

    // Emit to listeners that the session has been restored
    this.emit("persistent-session-restore");

    // Capture future store updates in the IndexedDB database
    this._subscribeToStateUpdatesForPersistence();
  }

  // Subscribes to state updates for persistence in IndexedDB
  private _subscribeToStateUpdatesForPersistence() {
    const _onStoreStateUpdate = (
      storeStateUpdateKeys: (keyof StoreStateProps)[],
    ) => {
      const state = this.getState();

      for (const persistenceKey of INDEXED_DB_PERSISTENCE_KEYS) {
        if (storeStateUpdateKeys.includes(persistenceKey)) {
          const valueToPersist = state[persistenceKey];
          this._indexedDBService.setItem(persistenceKey, valueToPersist);
        }
      }
    };
    this.on(StateEmitterDefaultEvents.UPDATE, _onStoreStateUpdate);

    this.registerDisposeFunction(() => {
      this.off(StateEmitterDefaultEvents.UPDATE, _onStoreStateUpdate);
    });
  }

  get isFreshSession() {
    const initialTickerBucketUUIDs = this.initialState.tickerBuckets.map(
      ({ uuid }) => uuid,
    );

    const currentTickerBucketUUIDs = this.state.tickerBuckets.map(
      ({ uuid }) => uuid,
    );

    return arraysEqual(initialTickerBucketUUIDs, currentTickerBucketUUIDs);
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
    fetchCacheSize().then((cacheSize) => {
      this.setState({ cacheSize });
    });
    fetchCacheDetails().then((cacheDetails) => this.setState({ cacheDetails }));
  }

  private _syncDataBuildInfo(): void {
    fetchDataBuildInfo().then((dataBuildInfo) => {
      this.setState({
        isRustInit: true,
        // TODO: If data build time is already set as state, but this indicates otherwise, that's a signal the app needs to update
        dataBuildTime: dataBuildInfo.time,
      });
    });
  }

  validateTickerBucketName(
    name: string,
    type: TickerBucket["type"],
    prevBucketName?: string,
  ): void {
    if (name.trim() === "") {
      throw new TickerBucketNameError("Name is required.");
    }

    if (name.trim().length < MIN_TICKER_BUCKET_NAME_LENGTH) {
      throw new TickerBucketNameError(
        `Name must be at least ${MIN_TICKER_BUCKET_NAME_LENGTH} characters long.`,
      );
    }

    // If the name isn't changing during an update, skip duplicate check
    if (prevBucketName && prevBucketName === name) {
      return;
    }

    const tickerBucketsOfType = this.getTickerBucketsOfType(type);
    for (const existingBucket of tickerBucketsOfType) {
      if (existingBucket.name === name) {
        throw new TickerBucketNameError(
          `Cannot add non-unique name "${name}" to a ticker bucket collection.`,
        );
      }
    }
  }

  createTickerBucket({
    name,
    type,
    description,
    isUserConfigurable,
    tickers = [],
  }: Omit<TickerBucket, "uuid">) {
    this.validateTickerBucketName(name, type);

    const newBucket: TickerBucket = {
      uuid: uuidv4(),
      name,
      tickers,
      type,
      description,
      isUserConfigurable,
    };

    this.setState((prev) => ({
      tickerBuckets: [newBucket, ...prev.tickerBuckets],
    }));
  }

  updateTickerBucket(prevBucket: TickerBucket, updatedBucket: TickerBucket) {
    // Validate the new name (but allow the same name to pass without throwing)
    this.validateTickerBucketName(
      updatedBucket.name,
      updatedBucket.type,
      prevBucket.name,
    );

    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.map((bucket) =>
        bucket.uuid === prevBucket.uuid
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
        (cachedBucket) => cachedBucket.uuid !== tickerBucket.uuid,
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
    const tickerAndExchange = await fetchSymbolAndExchange(tickerId);

    const symbol = tickerAndExchange[0];
    const exchangeShortName = tickerAndExchange[1];

    this.setState((prevState) => {
      const tickerBuckets = prevState.tickerBuckets.map((bucket) => {
        if (bucket.uuid === tickerBucket.uuid) {
          return {
            ...bucket,
            tickers: Array.from(
              new Set([
                // Intentionally prepend
                {
                  tickerId,
                  symbol,
                  exchangeShortName,
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
        if (bucket.uuid === tickerBucket.uuid) {
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

  getUserConfigurableTickerBuckets(): TickerBucket[] {
    return this.state.tickerBuckets.filter(({ isUserConfigurable }) =>
      Boolean(isUserConfigurable),
    );
  }

  getTickerBucketWithUUID(uuid: string): TickerBucket | undefined {
    return this.state.tickerBuckets.find(
      ({ uuid: predicateUUID }) => uuid === predicateUUID,
    );
  }

  getTickerBucketWithTypeAndName(
    type: TickerBucket["type"],
    name: TickerBucket["name"],
  ): TickerBucket | undefined {
    return this.state.tickerBuckets.find(
      ({ type: predicateType, name: predicateName }) =>
        type === predicateType && name === predicateName,
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
    const tickerDetail = await fetchTickerDetail(tickerId);
    const tickerBucketTicker: TickerBucketTicker = {
      tickerId,
      symbol: tickerDetail.symbol,
      exchangeShortName: tickerDetail.exchange_short_name,
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

  getTickerBucketsWithTicker(tickerId: number): TickerBucket[] {
    return this.state.tickerBuckets.filter((bucket) =>
      bucket.tickers.some((ticker) => ticker.tickerId === tickerId),
    );
  }

  async removeCacheEntry(key: string): Promise<void> {
    await removeCacheEntry(key);

    // For rapid UI update
    // This forces an immediate sync so that the UI does not appear laggy when clearing cache entries
    this._syncCacheDetails();
  }

  async clearCache() {
    await clearCache();

    // For rapid UI update
    // This forces an immediate sync so that the UI does not appear laggy when clearing cache entries
    this._syncCacheDetails();
  }

  addUIError(error: Error) {
    this.setState((prev) => ({
      uiErrors: [error, ...prev.uiErrors],
    }));
  }

  // FIXME: Rename to `wipe`?
  async reset() {
    const clearPromises = [];

    // Wipe IndexedDB store
    if (this._indexedDBService) {
      clearPromises.push(this._indexedDBService.clear());
    }

    // TODO: Call `clear` on connected persistent services?

    // Clear the cache
    clearPromises.push(this.clearCache());

    await Promise.all(clearPromises).finally(() => {
      // IMPORTANT: `dispose` should be called *before* `reset` or the fresh
      // store state will be synced to IndexedDB, and break `isFreshSession`
      // determination making it always think the session is an existing
      // session.
      this.dispose();

      super.reset();

      // Finally, refresh the page, as we're now in a non-recoverable state
      window.location.reload();
    });
  }
}

const store = new Store();

export default store;
export { Store, StateEmitterDefaultEvents };
