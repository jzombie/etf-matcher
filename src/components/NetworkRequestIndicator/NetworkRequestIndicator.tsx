import React, { useMemo } from "react";

import SyncIcon from "@mui/icons-material/Sync";
import IconButton from "@mui/material/IconButton";

import { useMultiMQTTRoomContext } from "@services/MultiMQTTRoomService/react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

import useStoreStateReader from "@hooks/useStoreStateReader";

import styles from "./NetworkRequestIndicator.module.scss";

export type NetworkRequestIndicatorProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  showNetworkURL?: boolean;
};

export default function NetworkRequestNotifier({
  className,
  showNetworkURL = true,
  ...rest
}: NetworkRequestIndicatorProps) {
  const { allRoomsInSync, connectedRooms, totalParticipantsForAllRooms } =
    useMultiMQTTRoomContext();

  const {
    latestXHROpenedRequestPathName,
    latestCacheOpenedRequestPathName,
    isOnline,
  } = useStoreStateReader([
    "latestXHROpenedRequestPathName",
    "latestCacheOpenedRequestPathName",
    "isOnline",
  ]);

  const networkURL =
    latestXHROpenedRequestPathName ||
    latestCacheOpenedRequestPathName ||
    (isOnline ? "Online" : "Offline");

  const onlineIndicatorClass = clsx({
    [styles.online_indicator]: true,
    [styles.xhr]: latestXHROpenedRequestPathName,
    [styles.cache]:
      latestCacheOpenedRequestPathName && !latestXHROpenedRequestPathName,
    [styles.online]:
      isOnline &&
      !latestXHROpenedRequestPathName &&
      !latestCacheOpenedRequestPathName,
    [styles.offline]: !isOnline,
  });

  const navigate = useNavigate();

  const handleSyncClick = () => {
    navigate("/settings");
  };

  const totalRooms = useMemo(
    () => Object.values(connectedRooms).length,
    [connectedRooms],
  );

  return (
    <div className={clsx(styles.notifier, className)} {...rest}>
      <IconButton
        title={`${totalParticipantsForAllRooms} connected device${totalParticipantsForAllRooms !== 1 ? "s" : ""}`}
        onClick={handleSyncClick}
        style={{
          background: "transparent",
          padding: 0,
          fontSize: "1rem",
          marginRight: 4,
        }}
      >
        <SyncIcon
          className={clsx({
            [styles.sync_indicator]: true,
            [styles.na]: !totalRooms,
            [styles.in_sync]: allRoomsInSync,
            // FIXME: This is rather naive, but good enough for now
            [styles.in_progress]: !allRoomsInSync && totalRooms > 0,
          })}
        />
        <span style={{ color: "#999" }}>{totalParticipantsForAllRooms}</span>
      </IconButton>
      <span className={onlineIndicatorClass} />
      {showNetworkURL && (
        <span className={styles.networkURL}>{networkURL}</span>
      )}
    </div>
  );
}
