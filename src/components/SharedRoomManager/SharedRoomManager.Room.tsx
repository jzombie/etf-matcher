import React, { useCallback, useState } from "react";

import { Button } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";

import useEventRefresh from "@hooks/useEventRefresh";

import MQTTRoom, { RoomEvents } from "@utils/MQTTRoom";
import { useMQTTRoomContext } from "@utils/MQTTRoom/react";

import { useSharedRoomManagerContext } from "./SharedRoomManagerProvider";

export type RoomProps = {
  room: MQTTRoom;
};

export default function Room({ room }: RoomProps) {
  const { disconnectFromRoom } = useMQTTRoomContext();

  useEventRefresh<RoomEvents>(room, ["peersupdate"]);

  const [qrCode, setQRCode] = useState<string | null>("");

  const { getRoomShareURL } = useSharedRoomManagerContext();

  const generateQRCode = useCallback(() => {
    alert(getRoomShareURL(room));

    store.PROTO_generateQRCode("TODO: Handle this").then(setQRCode);
  }, [getRoomShareURL, room]);

  return (
    <li key={room.roomName}>
      {room.roomName}{" "}
      <Button onClick={() => disconnectFromRoom(room)} color="secondary">
        Disconnect
      </Button>
      <Button
        onClick={() => room.send(new Date().toISOString(), { retain: true })}
      >
        PROTO: send & retain
      </Button>
      <Button onClick={generateQRCode}>PROTO: share</Button>
      {qrCode && (
        <AutoScaler style={{ width: 150, height: 150 }}>
          <div dangerouslySetInnerHTML={{ __html: qrCode }} />
        </AutoScaler>
      )}
      <div>Currently connected devices: {room.peers.length + 1}</div>
    </li>
  );
}
