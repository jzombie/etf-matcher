import React, { ReactNode, createContext, useContext } from "react";

import { useLocation } from "react-router-dom";

import MQTTRoom from "@utils/MQTTRoom";

interface SharedRoomManagerContextProps {
  getShareURL: (room: MQTTRoom) => string;
  getIsSharedURL: () => boolean;
}

const SharedRoomManagerContext = createContext<
  SharedRoomManagerContextProps | undefined
>(undefined);

export type SharedRoomManagerProviderProps = {
  children: ReactNode;
};

export default function SharedRoomManagerProvider({
  children,
}: SharedRoomManagerProviderProps) {
  const location = useLocation();

  // TODO: Build out
  const getShareURL = (room: MQTTRoom): string => {
    // Stub implementation, replace with your logic
    return `https://example.com/room/${room.roomName}`;
  };

  // TODO: Remove
  console.log({ location });

  // TODO: Build out
  const getIsSharedURL = (): boolean => {
    // Stub implementation, replace with your logic
    return window.location.href.includes("shared");
  };

  return (
    <SharedRoomManagerContext.Provider value={{ getShareURL, getIsSharedURL }}>
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
