import React from "react";

import { useMultiMQTTRoomContext } from "@services/MultiMQTTRoomService/react";

import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import ConnectForm from "./SharedSessionManager.ConnectForm";
import Room from "./SharedSessionManager.Room";

export default function SharedSessionManager() {
  const { connectedRooms } = useMultiMQTTRoomContext();

  return (
    <div>
      <ConnectForm />

      {Object.keys(connectedRooms).length > 0 && (
        // TODO: Also show disconnected rooms so they don't just disappear (related issue: https://linear.app/zenosmosis/issue/ZEN-114/fix-disappearing-mqtt-rooms)
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