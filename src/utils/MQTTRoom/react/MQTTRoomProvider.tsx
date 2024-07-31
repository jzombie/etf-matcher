import React, { ReactNode, createContext, useState } from "react";

import MQTTRoom, { validateTopic } from "@utils/MQTTRoom";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

interface MQTTRoomContextProps {
  rooms: Record<string, MQTTRoom>;
  connectToRoom: (roomName: string) => void;
  disconnectFromRoom: (room: MQTTRoom) => void;
  connectedRooms: Record<string, MQTTRoom>;
  isValidRoomName: (roomName: string) => boolean;
}

export const MQTTRoomContext = createContext<MQTTRoomContextProps | undefined>(
  undefined,
);

export default function MQTTRoomProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [rooms, setRooms] = useState<Record<string, MQTTRoom>>({});
  const [connectedRooms, setConnectedRooms] = useState<
    Record<string, MQTTRoom>
  >({});

  const connectToRoom = (roomName: string) => {
    if (!validateTopic(roomName) || rooms[roomName]) {
      console.error("Invalid or already connected room name");
      return;
    }

    const newRoom = new MQTTRoom(BROKER_URL, roomName);
    setRooms((prevRooms) => ({ ...prevRooms, [roomName]: newRoom }));

    newRoom.on("message", (data) => {
      console.log(`message from ${roomName}`, data);
    });

    newRoom.on("connect", () => {
      setConnectedRooms((prevRooms) => ({ ...prevRooms, [roomName]: newRoom }));

      console.log(`Connected to room: ${roomName}`);
    });

    newRoom.on("disconnect", () => {
      setConnectedRooms((prevRooms) => {
        const { [roomName]: _, ...remainingRooms } = prevRooms;
        return remainingRooms;
      });
    });

    newRoom.on("close", () => {
      setRooms((prevRooms) => {
        const { [roomName]: _, ...remainingRooms } = prevRooms;
        return remainingRooms;
      });

      setConnectedRooms((prevRooms) => {
        const { [roomName]: _, ...remainingRooms } = prevRooms;
        return remainingRooms;
      });

      console.log(`Disconnected from room: ${roomName}`);
    });
  };

  const disconnectFromRoom = (room: MQTTRoom) => {
    room.close();
  };

  const isValidRoomName = (roomName: string) => validateTopic(roomName);

  return (
    <MQTTRoomContext.Provider
      value={{
        rooms,
        connectToRoom,
        disconnectFromRoom,
        connectedRooms,
        isValidRoomName,
      }}
    >
      {children}
    </MQTTRoomContext.Provider>
  );
}
