import React, { useCallback, useMemo, useState } from "react";

import { Devices, ExitToApp, QrCode, Sync } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  Typography,
} from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import { MQTTRoom, MQTTRoomEvents } from "@services/MultiMQTTRoomService";
import { useMultiMQTTRoomContext } from "@services/MultiMQTTRoomService/react";
import { generateQRCode as libGenerateQRCode } from "@services/RustService";

import useEventRefresh from "@hooks/useEventRefresh";

import { useSharedSessionManagerContext } from "./SharedSessionManagerProvider";

export type RoomProps = {
  roomName: string;
};

export default function Room({ roomName }: RoomProps) {
  const { getRoomWithName } = useMultiMQTTRoomContext();
  const room = useMemo(
    () => getRoomWithName(roomName),
    [getRoomWithName, roomName],
  );

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {room ? (
          <RoomDetails room={room} />
        ) : (
          <Typography variant="body2">Room not found: {roomName}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

type RoomDetailsProps = {
  room: MQTTRoom;
};

function RoomDetails({ room }: RoomDetailsProps) {
  const { disconnectFromRoom } = useMultiMQTTRoomContext();
  const { getRoomShareURL } = useSharedSessionManagerContext();

  useEventRefresh<MQTTRoomEvents>(room, ["peersupdate", "syncupdate"]);

  const [qrCode, setQRCode] = useState<string | null>("");

  const generateQRCode = useCallback(() => {
    const roomShareURL = getRoomShareURL(room);
    libGenerateQRCode(roomShareURL).then(setQRCode);
  }, [getRoomShareURL, room]);

  const toggleQRCode = useCallback(() => {
    if (qrCode) {
      setQRCode(null);
    } else {
      generateQRCode();
    }
  }, [qrCode, generateQRCode]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {room.roomName}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Button
          onClick={() => disconnectFromRoom(room.roomName)}
          color="secondary"
          variant="outlined"
          startIcon={<ExitToApp />}
          sx={{ flexGrow: 1 }}
        >
          Disconnect
        </Button>
        <Button
          onClick={toggleQRCode}
          variant="outlined"
          startIcon={<QrCode />}
          sx={{ flexGrow: 1 }}
        >
          {!qrCode ? "Generate" : "Hide"} QR Code
        </Button>
      </Box>
      {qrCode && (
        <div>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Scan this QR code from another device to synchronize its state with
            this device.
          </Typography>
          <AutoScaler style={{ width: 150, height: 150, marginBottom: "1rem" }}>
            <div dangerouslySetInnerHTML={{ __html: qrCode }} />
          </AutoScaler>
        </div>
      )}
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Devices sx={{ mr: 1 }} />
            <Typography variant="body2">
              Currently connected devices: {room.peers.length + 1}
            </Typography>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Sync sx={{ mr: 1 }} />
            <Typography variant="body2">
              In sync: {room.isInSync ? "yes" : "no"}
            </Typography>
          </Box>
        </Grid2>
      </Grid2>
    </>
  );
}
