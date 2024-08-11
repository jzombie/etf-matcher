import customLogger from "./customLogger";

type TickerId = number;

export interface TickerTrackerVisibility {
  tickerId: TickerId;
  totalTimeVisible: number;
  visibilityStart: number | null;
  visibilityCount: number;
}

export interface TickerTrackerState {
  tickers: Record<TickerId, Omit<TickerTrackerVisibility, "visibilityStart">>;
  recentViews: TickerId[];
  orderedByTimeVisible?: TickerId[];
}

export default class TickerTracker {
  private tickers: Record<TickerId, TickerTrackerVisibility>;
  private recentViews: TickerId[];
  private orderedByTimeVisible?: TickerId[];

  constructor() {
    this.tickers = {};
    this.recentViews = [];
    this.orderedByTimeVisible = [];
    customLogger.debug("Creating a new TickerTracker instance.");
  }

  private _getOrInsertTickerWithId(
    tickerId: TickerId,
  ): TickerTrackerVisibility {
    if (!this.tickers[tickerId]) {
      customLogger.debug(`Inserting new ticker entry for ${tickerId}.`);
      this.tickers[tickerId] = {
        tickerId,
        totalTimeVisible: 0,
        visibilityStart: null,
        visibilityCount: 0,
      };
    }
    return this.tickers[tickerId];
  }

  public registerVisibleTickerIds(visibleTickerIds: TickerId[]): void {
    customLogger.debug(`Registering visible ticker IDs: ${visibleTickerIds}`);

    // End visibility for tickers that are no longer visible
    for (const tickerId in this.tickers) {
      if (!visibleTickerIds.includes(Number(tickerId))) {
        this._endVisibility(Number(tickerId));
      }
    }

    // Start visibility for currently visible tickers
    visibleTickerIds.forEach((tickerId) => {
      const tickerData = this._getOrInsertTickerWithId(tickerId);
      this._startVisibility(tickerData);

      // Move the ticker to the front of the recent views list
      const pos = this.recentViews.indexOf(tickerId);
      if (pos !== -1) {
        this.recentViews.splice(pos, 1);
      }
      this.recentViews.unshift(tickerId);
    });

    this.updateOrderedByTimeVisible();

    // Log the updated state after processing
    customLogger.debug(`TickerTracker state after registration:`, this.tickers);
  }

  private _startVisibility(tickerData: TickerTrackerVisibility): void {
    if (tickerData.visibilityStart === null) {
      tickerData.visibilityStart = Date.now();
      tickerData.visibilityCount += 1;
      customLogger.debug(
        `Starting visibility for ticker ${tickerData.tickerId}. Visibility Count: ${tickerData.visibilityCount}. Visibility Start: ${tickerData.visibilityStart}`,
      );
    } else {
      customLogger.debug(
        `Ticker ${tickerData.tickerId} is already visible. Visibility Start: ${tickerData.visibilityStart}`,
      );
    }
  }

  private _endVisibility(tickerId: TickerId): void {
    const tickerData = this.tickers[tickerId];
    if (tickerData && tickerData.visibilityStart !== null) {
      const endTime = Date.now();
      const elapsedTime = endTime - tickerData.visibilityStart;
      tickerData.totalTimeVisible += elapsedTime;
      tickerData.visibilityStart = null;

      customLogger.debug(
        `Ending visibility for ticker ${tickerId}. Start Time: ${tickerData.visibilityStart}, End Time: ${endTime}, Elapsed Time: ${elapsedTime}, Total Time Visible: ${tickerData.totalTimeVisible}`,
      );
    } else {
      customLogger.debug(
        `Ticker ${tickerId} was not visible. Visibility Start: ${tickerData?.visibilityStart}`,
      );
    }
  }

  private updateOrderedByTimeVisible(): void {
    const allTickerIds = Object.keys(this.tickers).map(Number);

    if (!this.orderedByTimeVisible) {
      this.orderedByTimeVisible = [];
    }

    // Sort all tickers by totalTimeVisible in descending order
    const sortedTickerIds = allTickerIds.sort(
      (a, b) =>
        this.tickers[b].totalTimeVisible - this.tickers[a].totalTimeVisible,
    );

    this.orderedByTimeVisible = sortedTickerIds;

    const orderedTickers = this.orderedByTimeVisible.map((id) => {
      const totalTimeVisible = this.tickers[id].totalTimeVisible;
      return `${id} (Total Time Visible: ${totalTimeVisible})`;
    });

    customLogger.debug(
      `Tickers ordered by time visible: ${orderedTickers.join(", ")}`,
    );
  }

  public exportState(): string {
    const state: TickerTrackerState = {
      tickers: Object.fromEntries(
        Object.entries(this.tickers).map(([id, data]) => [
          id,
          {
            tickerId: data.tickerId,
            totalTimeVisible: data.totalTimeVisible,
            // Ignore `visibilityStart` on over-the-wire updates
            visibilityCount: data.visibilityCount,
          },
        ]),
      ),
      recentViews: this.recentViews,
      orderedByTimeVisible: this.orderedByTimeVisible,
    };

    try {
      return JSON.stringify(state);
    } catch (err) {
      customLogger.error(`Failed to serialize TickerTracker:`, err);
      throw new Error("Failed to serialize TickerTracker");
    }
  }

  public importState(serialized: string): void {
    try {
      const importedState: TickerTrackerState = JSON.parse(serialized);

      // Merge the imported state with the existing state
      Object.entries(importedState.tickers).forEach(
        ([tickerIdStr, importedVisibility]) => {
          const tickerId = Number(tickerIdStr);
          const existingVisibility = this.tickers[tickerId] ?? {
            ...importedVisibility,
            // Ignore `visibilityStart` on over-the-wire updates
            visibilityStart: null,
          };

          existingVisibility.totalTimeVisible =
            importedVisibility.totalTimeVisible;
          existingVisibility.visibilityCount =
            importedVisibility.visibilityCount;

          this.tickers[tickerId] = existingVisibility;
        },
      );

      // Merge recent_views
      importedState.recentViews.forEach((tickerId) => {
        if (!this.recentViews.includes(tickerId)) {
          this.recentViews.push(tickerId);
        }
      });

      customLogger.debug(
        `Merged TickerTracker state after import:`,
        this.tickers,
      );
    } catch (err) {
      customLogger.error(`Failed to deserialize TickerTracker:`, err);
      throw new Error("Failed to deserialize TickerTracker");
    }
  }
}
