import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import store from "@src/store";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useOnlyOnce from "@hooks/useOnlyOnce";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

import MQTTRoom, { validateTopic } from "@utils/MQTTRoom";
import customLogger from "@utils/customLogger";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

interface MultiMQTTRoomContextProps {
  rooms: Record<string, MQTTRoom>;
  connectToRoom: (roomName: string) => void;
  disconnectFromRoom: (room: MQTTRoom) => void;
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
  const { triggerUIError } = useAppErrorBoundary();

  const [rooms, setRooms] = useState<Record<string, MQTTRoom>>({});
  const [connectedRooms, setConnectedRooms] = useState<
    Record<string, MQTTRoom>
  >({});

  const [allRoomsInSync, setAllRoomsInSync] = useState<boolean>(false);

  useEffect(() => {
    // This condition can also represent not yet being connected, in which case
    // we have no way of knowing we're in sync
    if (!Object.values(rooms).length) {
      setAllRoomsInSync(false);
      return;
    }

    const handleSyncUpdate = () => {
      // Check if all rooms are in sync
      const allInSync = Object.values(rooms).every((room) => room.isInSync);
      setAllRoomsInSync(allInSync);
    };

    for (const room of Object.values(rooms)) {
      room.on("syncupdate", handleSyncUpdate);
    }

    // Perform initial check
    handleSyncUpdate();

    // Cleanup listeners on unmount or rooms change
    return () => {
      for (const room of Object.values(rooms)) {
        room.off("syncupdate", handleSyncUpdate);
      }
    };
  }, [rooms]);

  // This is to prevent `connectToRoom` reference from changing on every render,
  // which can be problematic for `useEffect` instances which use this as context.
  const stableRoomsRef = useStableCurrentRef(rooms);

  const [totalParticipantsForAllRooms, setTotalParticipantsForAllRooms] =
    useState<number>(0);

  const calcTotalParticipantsForAllRooms = useCallback(() => {
    const rooms = stableRoomsRef.current;

    let totalParticipantsForAllRooms = 0;

    for (const room of Object.values(rooms)) {
      if (!room.isConnected) {
        continue;
      }

      totalParticipantsForAllRooms += 1 + room.peers.length;
    }

    setTotalParticipantsForAllRooms(totalParticipantsForAllRooms);
  }, [stableRoomsRef]);

  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleConnectingStateChange = useCallback(() => {
    const rooms = stableRoomsRef.current;

    setIsConnecting(Object.values(rooms).some((room) => room.isConnecting));
  }, [stableRoomsRef]);

  const connectToRoom = useCallback(
    (roomName: string) => {
      const rooms = stableRoomsRef.current;

      if (!validateTopic(roomName) || rooms[roomName]) {
        triggerUIError(
          new Error(`Invalid or already connected room name: ${roomName}`),
        );
        return;
      }

      const newRoom = new MQTTRoom(BROKER_URL, roomName);
      setRooms((prevRooms) => ({ ...prevRooms, [roomName]: newRoom }));

      // Capture this so that it can auto-connect in future sessions
      store.addMQTTRoomSubscription(newRoom);

      newRoom.on("message", (data) => {
        customLogger.debug(`message from ${roomName}`, data);
      });

      newRoom.on("connectingstateupdate", handleConnectingStateChange);

      newRoom.on("error", (err) => {
        triggerUIError(new Error(`Error connecting to room "${roomName}"`));
        customLogger.error(err);
      });

      newRoom.on("connect", () => {
        setConnectedRooms((prevRooms) => ({
          ...prevRooms,
          [roomName]: newRoom,
        }));

        customLogger.debug(`Connected to room: ${roomName}`);

        // Recalcuate total participants on connect
        calcTotalParticipantsForAllRooms();
      });

      // Recalcuate total participants on peer update
      newRoom.on("peersupdate", calcTotalParticipantsForAllRooms);

      newRoom.on("disconnect", () => {
        setConnectedRooms((prevRooms) => {
          const { [roomName]: _, ...remainingRooms } = prevRooms;
          return remainingRooms;
        });

        calcTotalParticipantsForAllRooms();
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

        // Recalcuate total participants on close
        calcTotalParticipantsForAllRooms();

        customLogger.log(`Disconnected from room: ${roomName}`);
      });
    },
    [
      stableRoomsRef,
      handleConnectingStateChange,
      calcTotalParticipantsForAllRooms,
      triggerUIError,
    ],
  );

  useOnlyOnce(() => {
    store.once("persistent-session-restore", () => {
      const { subscribedMQTTRoomNames } = store.getState([
        "subscribedMQTTRoomNames",
        "isIndexedDBReady",
      ]);

      for (const roomName of subscribedMQTTRoomNames) {
        connectToRoom(roomName);
      }
    });
  });

  const disconnectFromRoom = useCallback((room: MQTTRoom) => {
    // Capture this so that it can auto-connect in future sessions
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
        isConnecting,
        validateRoomName,
        allRoomsInSync,
        totalParticipantsForAllRooms,
      }}
    >
      {children}
    </MQTTRoomContext.Provider>
  );
}
