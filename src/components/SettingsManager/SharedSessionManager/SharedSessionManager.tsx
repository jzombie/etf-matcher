import React from "react";

import { Typography } from "@mui/material";

import { useMultiMQTTRoomContext } from "@services/MultiMQTTRoomService/react";

import Timer from "@components/Timer";
import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import useStoreStateReader from "@hooks/useStoreStateReader";

import ConnectForm from "./SharedSessionManager.ConnectForm";
import Room from "./SharedSessionManager.Room";

export default function SharedSessionManager() {
  const { subscribedMQTTRoomNames } = useStoreStateReader(
    "subscribedMQTTRoomNames",
  );

  const { nextAutoReconnectTime, getRemainingAutoReconnectTime } =
    useMultiMQTTRoomContext();

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
        <Typography sx={{ textAlign: "center", fontWeight: "bold" }}>
          No subscribed rooms.
        </Typography>
      )}

      {nextAutoReconnectTime && (
        <Typography sx={{ textAlign: "center", fontWeight: "bold" }}>
          {
            // TODO: Count down to reconnect
          }
          Next auto reconnect: <Timer onTick={getRemainingAutoReconnectTime} />
        </Typography>
      )}
    </div>
  );
}
