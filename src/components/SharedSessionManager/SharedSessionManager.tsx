import React from "react";

import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

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
          <UnstyledUL>
            {Object.values(connectedRooms).map((room) => (
              <UnstyledLI className="unstyled" key={room.roomName}>
                <Room room={room} />
              </UnstyledLI>
            ))}
          </UnstyledUL>
        </div>
      )}
    </div>
  );
}
