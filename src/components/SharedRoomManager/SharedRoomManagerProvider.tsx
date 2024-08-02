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

interface SharedRoomManagerContextProps {
  getRoomShareURL: (room: MQTTRoom) => string;
  parsedJoinRoomNameFromURLString: string | null;
}

const SharedRoomManagerContext = createContext<
  SharedRoomManagerContextProps | undefined
>(undefined);

export type SharedRoomManagerProviderProps = {
  children: React.ReactNode;
};

export default function SharedRoomManagerProvider({
  children,
}: SharedRoomManagerProviderProps) {
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
  // TODO: For initial received state updates, there should be a UI dialog confirmation
  // to export the current state before overwriting the local state with the update
  useEffect(() => {
    // Flag to determine if local state set should be immediately synced to peers
    let isOutboundSyncPaused = false;

    const _handleSendUpdate = (keys: (keyof StoreStateProps)[]) => {
      if (isOutboundSyncPaused) {
        return;
      }

      if (keys.includes("tickerBuckets")) {
        const { tickerBuckets } = store.getState(["tickerBuckets"]);

        for (const room of Object.values(connectedRooms)) {
          // TODO: Integrate ability to know when this has finished sending, and use to
          // help make a determination that the local state has fully synced up remotely
          room.send({ tickerBuckets } as object, { retain: true });
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
    <SharedRoomManagerContext.Provider
      value={{ getRoomShareURL, parsedJoinRoomNameFromURLString }}
    >
      {children}
    </SharedRoomManagerContext.Provider>
  );
}

export function useSharedRoomManagerContext() {
  const context = useContext(SharedRoomManagerContext);
  if (context === undefined) {
    throw new Error(
      "useSharedRoomManager must be used within a SharedRoomManagerProvider",
    );
  }
  return context;
}
