// MQTTRoomContext.tsx
import React, { ReactNode, createContext, useContext, useState } from "react";

import { Buffer } from "buffer";

import MQTTRoom, { validateTopic } from "@utils/MQTTRoom";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

interface MQTTRoomContextProps {
  rooms: Record<string, MQTTRoom>;
  connectToRoom: (roomName: string) => void;
  disconnectFromRoom: (roomName: string) => void;
  connectedRooms: string[];
  isValidRoomName: (roomName: string) => boolean;
}

const MQTTRoomContext = createContext<MQTTRoomContextProps | undefined>(
  undefined,
);

export const MQTTRoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rooms, setRooms] = useState<Record<string, MQTTRoom>>({});
  const [connectedRooms, setConnectedRooms] = useState<string[]>([]);

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

    newRoom.once("connect", () => {
      setConnectedRooms((prev) => [...prev, roomName]);

      // TODO: Remove
      newRoom.send("hello!");
      newRoom.send({ foo: "bar" });
      // Assuming store.getState() is valid
      // newRoom.send(store.getState(["tickerBuckets"]));
      newRoom.send(Buffer.from("Hello"));

      newRoom.on("peersupdate", () => {
        console.log(`peers in ${roomName}`, newRoom.peers);
      });

      newRoom.on("close", () => {
        setConnectedRooms((prev) => prev.filter((name) => name !== roomName));
        console.log(`${roomName} closed`);
      });
    });
  };

  const disconnectFromRoom = (roomName: string) => {
    const room = rooms[roomName];
    if (room) {
      room.close();
      setRooms((prevRooms) => {
        const { [roomName]: _, ...remainingRooms } = prevRooms;
        return remainingRooms;
      });
      setConnectedRooms((prev) => prev.filter((name) => name !== roomName));
    }
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
};

// TODO: Extract
export const useMQTTRoomContext = () => {
  const context = useContext(MQTTRoomContext);
  if (!context) {
    throw new Error(
      "useMQTTRoomContext must be used within a MQTTRoomProvider",
    );
  }
  return context;
};
