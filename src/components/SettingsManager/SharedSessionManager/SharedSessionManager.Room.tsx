import React, { useCallback, useState } from "react";

import { Devices, ExitToApp, QrCode, Sync } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid2,
  Typography,
} from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import { MQTTRoom, MQTTRoomEvents } from "@services/MultiMQTTRoomService";
import { useMultiMQTTRoomContext } from "@services/MultiMQTTRoomService/react";
import { generateQRCode as libGenerateQRCode } from "@services/RustService";

import Timer from "@components/Timer";

import useEventRefresh from "@hooks/useEventRefresh";

import { useSharedSessionManagerContext } from "./SharedSessionManagerProvider";

export type RoomProps = {
  roomName: string;
};

export default function Room({ roomName }: RoomProps) {
  const {
    getRoomWithName,
    nextAutoReconnectTime,
    getRemainingAutoReconnectTime,
    connectToRoom,
  } = useMultiMQTTRoomContext();

  // IMPORTANT: This should *not* be memoized, as it may change if the room reconnects
  const room = getRoomWithName(roomName);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {room ? (
          <RoomControls room={room} />
        ) : (
          <>
            <Alert severity="warning">Room not connected: {roomName}</Alert>
            {nextAutoReconnectTime && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Next auto reconnect:{" "}
                  <Timer onTick={getRemainingAutoReconnectTime} />
                </Typography>
                <Button
                  onClick={() => connectToRoom(roomName)}
                  variant="contained"
                >
                  Reconnect now
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

type RoomControlsProps = {
  room: MQTTRoom;
};

function RoomControls({ room }: RoomControlsProps) {
  // FIXME: This usage of two providers can get a bit confusing. Perhaps the
  // `SharedSessionManagerProvider` should either expose all of these methods,
  // or just move everything into the `MultiMQTTRoomProvider`. My original
  // intentions were to keep these separate to allow for more flexibility in
  // the future, but it may not be worth the complexity.
  const { disconnectFromRoom } = useMultiMQTTRoomContext();
  const { getRoomShareURL } = useSharedSessionManagerContext();

  useEventRefresh<MQTTRoomEvents>(room, [
    "peersupdate",
    "syncupdate",
    "connectingstateupdate",
    "connectionstateupdate",
  ]);

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
          disabled={!room.isConnected}
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
      {room.isConnecting && (
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Box>
      )}
      {room.isConnected && (
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
      )}
    </>
  );
}
