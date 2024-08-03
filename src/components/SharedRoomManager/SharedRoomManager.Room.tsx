import React, { useCallback, useState } from "react";

import { Devices, ExitToApp, QrCode, Sync } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import store from "@src/store";

import useEventRefresh from "@hooks/useEventRefresh";

import MQTTRoom, { MQTTRoomEvents } from "@utils/MQTTRoom";
import { useMultiMQTTRoomContext } from "@utils/MQTTRoom/react";

import { useSharedRoomManagerContext } from "./SharedRoomManagerProvider";

export type RoomProps = {
  room: MQTTRoom;
};

export default function Room({ room }: RoomProps) {
  const { disconnectFromRoom } = useMultiMQTTRoomContext();

  useEventRefresh<MQTTRoomEvents>(room, ["peersupdate", "syncupdate"]);

  const [qrCode, setQRCode] = useState<string | null>("");

  const { getRoomShareURL } = useSharedRoomManagerContext();

  const generateQRCode = useCallback(() => {
    const roomShareURL = getRoomShareURL(room);

    store.PROTO_generateQRCode(roomShareURL).then(setQRCode);
  }, [getRoomShareURL, room]);

  const toggleQRCode = useCallback(() => {
    if (qrCode) {
      setQRCode(null);
    } else {
      generateQRCode();
    }
  }, [qrCode, generateQRCode]);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {room.roomName}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Button
            onClick={() => disconnectFromRoom(room)}
            color="secondary"
            variant="outlined"
            startIcon={<ExitToApp />}
          >
            Disconnect
          </Button>
          <Button
            onClick={toggleQRCode}
            variant="outlined"
            startIcon={<QrCode />}
          >
            {!qrCode ? "Generate" : "Hide"} QR Code
          </Button>
        </Box>
        {qrCode && (
          <AutoScaler style={{ width: 150, height: 150, marginBottom: "1rem" }}>
            <div dangerouslySetInnerHTML={{ __html: qrCode }} />
          </AutoScaler>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Devices sx={{ mr: 1 }} />
              <Typography>
                Currently connected devices: {room.peers.length + 1}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Sync sx={{ mr: 1 }} />
              <Typography>In sync: {room.isInSync ? "yes" : "no"}</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
