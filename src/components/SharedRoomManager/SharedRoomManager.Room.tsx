import React from "react";

import { Button } from "@mui/material";

import MQTTRoom from "@utils/MQTTRoom";
import { useMQTTRoomContext } from "@utils/MQTTRoom/react";

// TODO: Add linkable QR code URL

export type RoomProps = {
  room: MQTTRoom;
};

export default function Room({ room }: RoomProps) {
  const { disconnectFromRoom } = useMQTTRoomContext();

  return (
    <li key={room.roomName}>
      {room.roomName}{" "}
      <Button onClick={() => disconnectFromRoom(room)} color="secondary">
        Disconnect
      </Button>
      <Button
        onClick={() => room.send(new Date().toISOString(), { retain: true })}
      >
        PROTO: send & retain
      </Button>
    </li>
  );
}
