import React, { ReactNode, createContext, useCallback } from "react";

import store from "@src/store";

import { useStateEmitterReader } from "@utils/StateEmitter";
import customLogger from "@utils/customLogger";

import MQTTRoom from "../MQTTRoom";
import validateTopic from "../validateTopic";

interface MultiMQTTRoomContextProps {
  rooms: Record<string, MQTTRoom>;
  connectToRoom: (roomName: string) => void;
  disconnectFromRoom: (roomName: string) => void;
  connectedRooms: Record<string, MQTTRoom>;
  isConnecting: boolean;
  validateRoomName: (roomName: string) => boolean;
  allRoomsInSync: boolean;
  totalParticipantsForAllRooms: number;
}

export const MQTTRoomContext = createContext<
  MultiMQTTRoomContextProps | undefined
>(undefined);

export default function MultiMQTTRoomProvider({
  children,
}: {
  children: ReactNode;
}) {
  const multiMQTTRoomService = store.multiMQTTRoomService;

  const {
    rooms,
    connectedRooms,
    isConnecting,
    allRoomsInSync,
    totalParticipantsForAllRooms,
  } = useStateEmitterReader(multiMQTTRoomService, [
    "rooms",
    "connectedRooms",
    "isConnecting",
    "allRoomsInSync",
    "totalParticipantsForAllRooms",
  ]);

  const connectToRoom = useCallback(
    async (roomName: string) => {
      try {
        await multiMQTTRoomService.connectToRoom(roomName);
      } catch (error) {
        // TODO: Route up to UI
        customLogger.error(error);
      }
    },
    [multiMQTTRoomService],
  );

  const disconnectFromRoom = useCallback(
    async (roomName: string) => {
      try {
        await multiMQTTRoomService.disconnectFromRoom(roomName);
      } catch (error) {
        // TODO: Route up to UI
        customLogger.error(error);
      }
    },
    [multiMQTTRoomService],
  );

  return (
    <MQTTRoomContext.Provider
      value={{
        rooms,
        connectToRoom,
        disconnectFromRoom,
        isConnecting,
        connectedRooms,
        validateRoomName: validateTopic,
        allRoomsInSync,
        totalParticipantsForAllRooms,
      }}
    >
      {children}
    </MQTTRoomContext.Provider>
  );
}
