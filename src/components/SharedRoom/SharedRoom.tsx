import React, { useState } from "react";

import { Button, TextField } from "@mui/material";

import { useMQTTRoomContext } from "@utils/MQTTRoom/react";
import customLogger from "@utils/customLogger";

export default function SharedRoom() {
  const [roomName, setRoomName] = useState("");
  const { connectToRoom, disconnectFromRoom, connectedRooms, isValidRoomName } =
    useMQTTRoomContext();
  const [isValid, setIsValid] = useState(true);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidRoomName(roomName)) {
      customLogger.error("Invalid room name");
      return;
    }
    connectToRoom(roomName);
    setRoomName(""); // Clear the input after connecting
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRoomName(value);
    setIsValid(isValidRoomName(value));
  };

  return (
    <div>
      <form onSubmit={handleConnect}>
        <TextField
          label="Room Name"
          value={roomName}
          onChange={handleRoomNameChange}
          variant="outlined"
          style={{ margin: "10px 0" }}
          disabled={false}
        />
        <Button type="submit" disabled={!roomName || !isValid}>
          Connect
        </Button>
      </form>

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
