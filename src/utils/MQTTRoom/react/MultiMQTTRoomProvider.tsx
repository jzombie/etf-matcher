import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import store from "@src/store";

import MQTTRoom, { validateTopic } from "@utils/MQTTRoom";
import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

interface MultiMQTTRoomContextProps {
  rooms: Record<string, MQTTRoom>;
  connectToRoom: (roomName: string) => void;
  disconnectFromRoom: (room: MQTTRoom) => void;
  connectedRooms: Record<string, MQTTRoom>;
  validateRoomName: (roomName: string) => boolean;
}

export const MQTTRoomContext = createContext<
  MultiMQTTRoomContextProps | undefined
>(undefined);

export default function MultiMQTTRoomProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [rooms, setRooms] = useState<Record<string, MQTTRoom>>({});
  const [connectedRooms, setConnectedRooms] = useState<
    Record<string, MQTTRoom>
  >({});

  const connectToRoom = useCallback(
    (roomName: string) => {
      if (!validateTopic(roomName) || rooms[roomName]) {
        customLogger.error("Invalid or already connected room name");
        return;
      }

      const newRoom = new MQTTRoom(BROKER_URL, roomName);
      setRooms((prevRooms) => ({ ...prevRooms, [roomName]: newRoom }));

      store.addMQTTRoomSubscription(newRoom);

      newRoom.on("message", (data) => {
        customLogger.debug(`message from ${roomName}`, data);
      });

      // TODO: Pipe up as UI notification
      newRoom.on("error", (err) => {
        customLogger.error(err);
      });

      newRoom.on("connect", () => {
        setConnectedRooms((prevRooms) => ({
          ...prevRooms,
          [roomName]: newRoom,
        }));

        customLogger.debug(`Connected to room: ${roomName}`);
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

        customLogger.log(`Disconnected from room: ${roomName}`);
      });
    },
    [rooms],
  );

  useEffect(() => {
    // Note: `debounceWithKey` is used here specifically to only handle once,
    // regardless if `StrictMode` is used during development. There is likely
    // a better way to do this.
    debounceWithKey(
      "mqtt_room_auto_connect",
      () => {
        const { subscribedMQTTRoomNames } = store.getState([
          "subscribedMQTTRoomNames",
        ]);

        for (const roomName of subscribedMQTTRoomNames) {
          connectToRoom(roomName);
        }
      },
      50,
    );
  }, [connectToRoom]);

  const disconnectFromRoom = useCallback((room: MQTTRoom) => {
    store.removeMQTTRoomSubscription(room);

    room.close();
  }, []);

  const validateRoomName = useCallback(
    (roomName: string) => validateTopic(roomName),
    [],
  );

  return (
    <MQTTRoomContext.Provider
      value={{
        rooms,
        connectToRoom,
        disconnectFromRoom,
        connectedRooms,
        validateRoomName,
      }}
    >
      {children}
    </MQTTRoomContext.Provider>
  );
}
