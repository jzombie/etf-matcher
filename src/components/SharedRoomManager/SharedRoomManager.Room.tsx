import React, { useCallback, useState } from "react";

import { Button } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";

import MQTTRoom from "@utils/MQTTRoom";
import { useMQTTRoomContext } from "@utils/MQTTRoom/react";

import { useSharedRoomManagerContext } from "./SharedRoomManagerProvider";

// TODO: Add linkable QR code URL

export type RoomProps = {
  room: MQTTRoom;
};

export default function Room({ room }: RoomProps) {
  const { disconnectFromRoom } = useMQTTRoomContext();

  const [qrCode, setQRCode] = useState<string | null>("");

  const { getShareURL } = useSharedRoomManagerContext();

  const generateQRCode = useCallback(() => {
    alert(getShareURL(room));

    store.PROTO_generateQRCode("TODO: Handle this").then(setQRCode);
  }, [getShareURL, room]);

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
    </li>
  );
}
