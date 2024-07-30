import React, { useState } from "react";

import { Button, TextField } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";

import { useMQTTRoomContext } from "@utils/MQTTRoom/react";

// Import MQTTRoomContext and MQTTRoomProvider

export default function ProtoP2P() {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const { connectToRoom, disconnectFromRoom, connectedRooms, isValidRoomName } =
    useMQTTRoomContext();
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !isValidRoomName(roomName)) {
      console.error("Invalid room name");
      return;
    }
    connectToRoom(roomName);
    setRoomName(""); // Clear the input after connecting
  };

  const handleDisconnect = (roomName: string) => {
    disconnectFromRoom(roomName);
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRoomName(value);
    setIsValid(isValidRoomName(value));
  };

  return (
    <div>
      <Button
        onClick={() =>
          store
            .PROTO_generateQRCode("https://etfmatcher.com")
            .then((result) => {
              setQRCode(result);
            })
        }
      >
        PROTO::generateQRCode(&quot;Hello World&quot;)
      </Button>

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

      {connectedRooms.length > 0 && (
        <div>
          <h3>Connected Rooms:</h3>
          <ul>
            {connectedRooms.map((room) => (
              <li key={room}>
                {room}{" "}
                <Button
                  onClick={() => handleDisconnect(room)}
                  color="secondary"
                >
                  Disconnect
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {qrCode && (
        <AutoScaler style={{ width: 100, height: 100 }}>
          <div dangerouslySetInnerHTML={{ __html: qrCode }} />
        </AutoScaler>
      )}
    </div>
  );
}
