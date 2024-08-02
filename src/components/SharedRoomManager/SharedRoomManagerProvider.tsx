import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useLocation } from "react-router-dom";

import MQTTRoom from "@utils/MQTTRoom";
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
  const { connectToRoom } = useMultiMQTTRoomContext();

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
