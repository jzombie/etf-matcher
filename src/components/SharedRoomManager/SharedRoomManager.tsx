import React from "react";

import { useMQTTRoomContext } from "@utils/MQTTRoom/react";

import ConnectForm from "./SharedRoomManager.ConnectForm";
import Room from "./SharedRoomManager.Room";

export default function SharedRoomManager() {
  const { connectedRooms } = useMQTTRoomContext();

  return (
    <div>
      <ConnectForm />

      {Object.keys(connectedRooms).length > 0 && (
        <div>
          <h3>Connected Rooms:</h3>
          <ul>
            {Object.values(connectedRooms).map((room) => (
              <Room key={room.roomName} room={room} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
