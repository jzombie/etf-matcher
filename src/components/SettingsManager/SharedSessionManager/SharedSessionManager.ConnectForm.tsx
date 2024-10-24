import React, { useCallback, useState } from "react";

import { Box, Button, InputAdornment, TextField } from "@mui/material";

import { useMultiMQTTRoomContext } from "@services/MultiMQTTRoomService/react";

import customLogger from "@utils/customLogger";

export default function ConnectForm() {
  const [roomName, setRoomName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const { connectToRoom, validateRoomName } = useMultiMQTTRoomContext();

  const handleConnect = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateRoomName(roomName)) {
        customLogger.error(`Invalid room name: ${roomName}`);
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

  const isError = !isValid && roomName.length > 0;

  return (
    <>
      <Box
        component="form"
        onSubmit={handleConnect}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: 2,
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <TextField
          label="Room Name"
          value={roomName}
          onChange={handleRoomNameChange}
          variant="outlined"
          error={isError}
          helperText={isError ? "Invalid room name" : ""}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!roomName || !isValid}
                >
                  Connect
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
}
