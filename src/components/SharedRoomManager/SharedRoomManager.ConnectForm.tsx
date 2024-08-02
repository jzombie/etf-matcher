import React, { useCallback, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useMultiMQTTRoomContext } from "@utils/MQTTRoom/react";
import customLogger from "@utils/customLogger";

export default function ConnectForm() {
  const [roomName, setRoomName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const { connectToRoom, validateRoomName } = useMultiMQTTRoomContext();

  const handleConnect = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateRoomName(roomName)) {
        customLogger.error("Invalid room name");
        return;
      }
      connectToRoom(roomName);
      setRoomName(""); // Clear the input after connecting
    },
    [connectToRoom, roomName, validateRoomName],
  );

  const handleRoomNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setRoomName(value);
      setIsValid(validateRoomName(value));
    },
    [validateRoomName],
  );

  return (
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
  );
}
