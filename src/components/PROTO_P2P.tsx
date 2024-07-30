import React, { useState } from "react";

import { Button, TextField } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";
import { Buffer } from "buffer";

import MQTTRoom, { validateTopic } from "@utils/MQTTRoom";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

export default function ProtoP2P() {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<MQTTRoom | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleConnect = () => {
    if (!roomName || !validateTopic(roomName)) {
      console.error("Invalid room name");
      return;
    }

    const newRoom = new MQTTRoom(BROKER_URL, roomName);
    setRoom(newRoom);

    newRoom.on("message", (data) => {
      console.log("message", data);
    });

    newRoom.once("connect", () => {
      setConnected(true);

      newRoom.on("message", (data) => {
        console.log(data);
      });

      newRoom.send("hello!");
      newRoom.send({ foo: "bar" });
      newRoom.send(store.getState(["tickerBuckets"]));
      newRoom.send(Buffer.from("Hello"));

      newRoom.on("peersupdate", () => {
        console.log("peers", newRoom.peers);
      });

      newRoom.on("close", () => {
        setConnected(false);
        console.log("closed");
      });
    });

    // setTimeout(() => {
    //   console.warn("Automatically closing");

    //   room.close();
    // }, 10000);
  };

  const handleDisconnect = () => {
    if (room) {
      room.close();
      setRoom(null);
      setConnected(false);
    }
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRoomName(value);
    setIsValid(validateTopic(value));
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConnect();
        }}
      >
        <TextField
          label="Room Name"
          value={roomName}
          onChange={handleRoomNameChange}
          variant="outlined"
          style={{ margin: "10px 0" }}
          disabled={connected}
        />

        <Button type="submit" disabled={!roomName || !isValid || connected}>
          Connect
        </Button>

        {connected && (
          <Button onClick={handleDisconnect} color="secondary">
            Disconnect
          </Button>
        )}
      </form>

      {qrCode && (
        <AutoScaler style={{ width: 100, height: 100 }}>
          <div dangerouslySetInnerHTML={{ __html: qrCode }} />
        </AutoScaler>
      )}
    </div>
  );
}
