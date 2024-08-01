import React from "react";

import { Button } from "@mui/material";

import { useMQTTRoomContext } from "@utils/MQTTRoom/react";

import ConnectForm from "./SharedRoomManager.ConnectForm";

export default function SharedRoom() {
  const { disconnectFromRoom, connectedRooms } = useMQTTRoomContext();

  return (
    <div>
      <ConnectForm />

      {Object.keys(connectedRooms).length > 0 && (
        <div>
          <h3>Connected Rooms:</h3>
          <ul>
            {Object.values(connectedRooms).map((room) => (
              <li key={room.roomName}>
                {room.roomName}{" "}
                <Button
                  onClick={() => disconnectFromRoom(room)}
                  color="secondary"
                >
                  Disconnect
                </Button>
                <Button
                  onClick={() =>
                    room.send(new Date().toISOString(), { retain: true })
                  }
                >
                  PROTO: send & retain
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
