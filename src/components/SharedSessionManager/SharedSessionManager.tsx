import React from "react";

import { useMultiMQTTRoomContext } from "@utils/MQTTRoom/react";

import ConnectForm from "./SharedSessionManager.ConnectForm";
import Room from "./SharedSessionManager.Room";

export default function SharedSessionManager() {
  const { connectedRooms } = useMultiMQTTRoomContext();

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
