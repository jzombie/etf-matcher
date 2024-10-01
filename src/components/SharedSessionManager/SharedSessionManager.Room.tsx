import React, { useCallback, useState } from "react";

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
import { MQTTRoom, MQTTRoomEvents } from "@services/MQTTRoomService";
import { useMultiMQTTRoomContext } from "@services/MQTTRoomService/react";
import { generateQRCode as libGenerateQRCode } from "@services/RustService";

import useEventRefresh from "@hooks/useEventRefresh";

import { useSharedSessionManagerContext } from "./SharedSessionManagerProvider";

export type RoomProps = {
  room: MQTTRoom;
};

export default function Room({ room }: RoomProps) {
  const { disconnectFromRoom } = useMultiMQTTRoomContext();

  useEventRefresh<MQTTRoomEvents>(room, ["peersupdate", "syncupdate"]);

  const [qrCode, setQRCode] = useState<string | null>("");

  const { getRoomShareURL } = useSharedSessionManagerContext();

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
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {room.roomName}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Distributes space between buttons
            gap: 2, // Adds space between buttons
            mb: 2,
            flexWrap: "wrap", // Makes buttons wrap on smaller screens
          }}
        >
          <Button
            onClick={() => disconnectFromRoom(room)}
            color="secondary"
            variant="outlined"
            startIcon={<ExitToApp />}
            sx={{ flexGrow: 1 }} // Makes buttons grow evenly
          >
            Disconnect
          </Button>
          <Button
            onClick={toggleQRCode}
            variant="outlined"
            startIcon={<QrCode />}
            sx={{ flexGrow: 1 }} // Makes buttons grow evenly
          >
            {!qrCode ? "Generate" : "Hide"} QR Code
          </Button>
        </Box>
        {qrCode && (
          <div>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              Scan this QR code from another device to synchronize its state
              with this device.
            </Typography>
            <AutoScaler
              style={{ width: 150, height: 150, marginBottom: "1rem" }}
            >
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
      </CardContent>
    </Card>
  );
}
