import React from "react";

import { Typography } from "@mui/material";

import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import useStoreStateReader from "@hooks/useStoreStateReader";

import ConnectForm from "./SharedSessionManager.ConnectForm";
import Room from "./SharedSessionManager.Room";

export default function SharedSessionManager() {
  const { subscribedMQTTRoomNames } = useStoreStateReader(
    "subscribedMQTTRoomNames",
  );

  return (
    <div>
      <ConnectForm />

      {subscribedMQTTRoomNames.length > 0 ? (
        <div>
          <h3>
            Subscribed Room{subscribedMQTTRoomNames.length !== 1 ? "s" : ""}:
          </h3>
          <UnstyledUL>
            {subscribedMQTTRoomNames.map((roomName) => (
              <UnstyledLI className="unstyled" key={roomName}>
                <Room roomName={roomName} />
              </UnstyledLI>
            ))}
          </UnstyledUL>
        </div>
      ) : (
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "text.secondary",
            mt: 2,
          }}
        >
          No subscribed rooms.
        </Typography>
      )}
    </div>
  );
}
