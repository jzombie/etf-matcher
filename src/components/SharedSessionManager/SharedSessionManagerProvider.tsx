import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import store, { StateEmitterDefaultEvents, StoreStateProps } from "@src/store";
import { useLocation } from "react-router-dom";

import MQTTRoom, { MQTTRoomEvents } from "@utils/MQTTRoom";
import { useMultiMQTTRoomContext } from "@utils/MQTTRoom/react";

interface SharedSessionManagerContextProps {
  getRoomShareURL: (room: MQTTRoom) => string;
  parsedJoinRoomNameFromURLString: string | null;
}

const SharedSessionManagerContext = createContext<
  SharedSessionManagerContextProps | undefined
>(undefined);

export type SharedSessionManagerProviderProps = {
  children: React.ReactNode;
};

export default function SharedSessionManagerProvider({
  children,
}: SharedSessionManagerProviderProps) {
  const { connectToRoom, connectedRooms } = useMultiMQTTRoomContext();

  const location = useLocation();

  const getRoomShareURL = useCallback((room: MQTTRoom): string => {
    const origin = window.location.origin;
    const localPath = `/settings#join:${encodeURIComponent(room.roomName)}`;

    return `${origin}${localPath}`;
  }, []);

  const parseJoinRoomFromURL = useCallback((): string | null => {
    const hash = window.location.hash;
    const match = hash.match(/#join:([^&]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  const [parsedJoinRoomNameFromURLString, setParsedJoinRoomFromURLString] =
    useState<string | null>(null);

  // Listen for `location` changes and parse URL for joined room name
  useEffect(() => {
    // Consume the dependency either way
    if (location || !location) {
      const parsedJoinRoom = parseJoinRoomFromURL();
      setParsedJoinRoomFromURLString(parsedJoinRoom);
    }
  }, [location, parseJoinRoomFromURL]);

  useEffect(() => {
    if (parsedJoinRoomNameFromURLString) {
      connectToRoom(parsedJoinRoomNameFromURLString);
    }
  }, [parsedJoinRoomNameFromURLString, connectToRoom]);

  // Handle over-the-wire state sync
  //
  // TODO: On the initial message (assuming there is a retained message, etc.), determine
  // if the store is in a `clean` initial state (either at `initial` state or at post-async
  // init) and if not in the clean state, prompt the user for how they wish to handle the
  // first incoming merge
  //
  // TODO: When joining a room, after making a determination if it's a new room or a
  // pre-existing (where there may be retained state updates pending), if no pending retained
  // updates, send the local state.
  useEffect(() => {
    // Flag to determine if local state set should be immediately synced to peers
    let isOutboundSyncPaused = false;

    const _handleSendUpdate = (keys: (keyof StoreStateProps)[]) => {
      if (isOutboundSyncPaused) {
        return;
      }

      if (
        keys.includes("tickerBuckets") ||
        keys.includes("tickerTrackerStateJSON")
      ) {
        const { tickerBuckets, tickerTrackerStateJSON } = store.getState([
          "tickerBuckets",
          "tickerTrackerStateJSON",
        ]);

        for (const room of Object.values(connectedRooms)) {
          room.send({ tickerBuckets, tickerTrackerStateJSON } as object, {
            qos: 2,
            retain: true,
          });
        }
      }
    };

    store.on(StateEmitterDefaultEvents.UPDATE, _handleSendUpdate);

    const _handleReceiveUpdate = (
      receivedData: MQTTRoomEvents["message"][0],
    ) => {
      const batchUpdate: Partial<StoreStateProps> = {};

      for (const key of Object.keys(
        receivedData.data,
      ) as (keyof StoreStateProps)[]) {
        if (key in store.state) {
          // @ts-expect-error  Note: This type isn't correct according to TypeScript
          batchUpdate[key] = (receivedData.data as Partial<StoreStateProps>)[
            key as keyof StoreStateProps
          ];
        }
      }

      if (Object.keys(batchUpdate).length) {
        // Prevent state set received from peer from going back out to peers
        isOutboundSyncPaused = true;

        // FIXME: If `setState` is ever made into an asynchronous method, this
        // should be awaited
        store.setState(batchUpdate);

        // Reenable outbound sync
        isOutboundSyncPaused = false;
      }
    };

    for (const room of Object.values(connectedRooms)) {
      room.on("message", _handleReceiveUpdate);
    }

    return () => {
      store.off(StateEmitterDefaultEvents.UPDATE, _handleSendUpdate);

      for (const room of Object.values(connectedRooms)) {
        room.off("message", _handleReceiveUpdate);
      }
    };
  }, [connectedRooms]);

  return (
    <SharedSessionManagerContext.Provider
      value={{ getRoomShareURL, parsedJoinRoomNameFromURLString }}
    >
      {children}
    </SharedSessionManagerContext.Provider>
  );
}

export function useSharedSessionManagerContext() {
  const context = useContext(SharedSessionManagerContext);
  if (context === undefined) {
    throw new Error(
      "useSharedSessionManager must be used within a SharedSessionManagerProvider",
    );
  }
  return context;
}