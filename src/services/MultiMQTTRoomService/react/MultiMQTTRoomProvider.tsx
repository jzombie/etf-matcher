import React, { ReactNode, createContext, useCallback } from "react";

import store from "@src/store";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import { useStateEmitterReader } from "@utils/StateEmitter";
import customLogger from "@utils/customLogger";

import MQTTRoom from "../MQTTRoom";
import validateTopic from "../validateTopic";

interface MultiMQTTRoomContextProps {
  rooms: Record<string, MQTTRoom>;
  connectToRoom: (roomName: string) => Promise<void>;
  disconnectFromRoom: (roomName: string) => Promise<void>;
  connectedRooms: Record<string, MQTTRoom>;
  isConnecting: boolean;
  validateRoomName: (roomName: string) => boolean;
  allRoomsInSync: boolean;
  totalParticipantsForAllRooms: number;
  getRoomWithName: (roomName: string) => MQTTRoom | undefined;
  nextAutoReconnectTime: Date | null;
  getRemainingAutoReconnectTime: () => number | null;
}

export const MQTTRoomContext = createContext<
  MultiMQTTRoomContextProps | undefined
>(undefined);

export default function MultiMQTTRoomProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { triggerUIError } = useAppErrorBoundary();

  const multiMQTTRoomService = store.multiMQTTRoomService;

  const {
    rooms,
    connectedRooms,
    isConnecting,
    allRoomsInSync,
    totalParticipantsForAllRooms,
    nextAutoReconnectTime,
  } = useStateEmitterReader(multiMQTTRoomService, [
    "rooms",
    "connectedRooms",
    "isConnecting",
    "allRoomsInSync",
    "totalParticipantsForAllRooms",
    "nextAutoReconnectTime",
  ]);

  const getRoomWithName = useCallback(
    (roomName: string) => multiMQTTRoomService.getRoomWithName(roomName),
    [multiMQTTRoomService],
  );

  const connectToRoom = useCallback(
    async (roomName: string) => {
      try {
        await multiMQTTRoomService.connectToRoom(roomName);
      } catch (err) {
        triggerUIError(new Error(`Error connecting to room: ${roomName}`));
        customLogger.error(err);
      }
    },
    [multiMQTTRoomService, triggerUIError],
  );

  const disconnectFromRoom = useCallback(
    async (roomName: string) => {
      try {
        await multiMQTTRoomService.disconnectFromRoom(roomName);
      } catch (err) {
        triggerUIError(new Error(`Error disconnecting from room: ${roomName}`));
        customLogger.error(err);
      }
    },
    [multiMQTTRoomService, triggerUIError],
  );

  const getRemainingAutoReconnectTime = useCallback(() => {
    return multiMQTTRoomService.getRemainingAutoReconnectTime();
  }, [multiMQTTRoomService]);

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
        getRoomWithName,
        nextAutoReconnectTime,
        getRemainingAutoReconnectTime,
      }}
    >
      {children}
    </MQTTRoomContext.Provider>
  );
}
