import React from "react";

import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import LazyRender from "@components/LazyRender";
import Section from "@components/Section";
import SharedRoomManager from "@components/SharedRoomManager";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import formatByteSize from "@utils/formatByteSize";
import formatLocalTime from "@utils/formatLocalTime";

import RustCachePieChart from "./SettingsManager.RustCachePieChart";
import RustCacheTable from "./SettingsManager.RustCacheTable";
import UserDataSection from "./SettingsManager.UserDataSection";

export default function SettingsManager() {
  const {
    isHTMLJSVersionSynced,
    isAppUnlocked,
    isIndexedDBReady,
    isProductionBuild,
    isRustInit,
    dataBuildTime,
    isDirtyState,
    visibleTickerIds,
    isOnline,
    isProfilingCacheOverlayOpen,
    isGAPageTrackingEnabled,
    cacheDetails,
    cacheSize,
    rustServiceXHRRequestErrors,
    subscribedMQTTRoomNames,
  } = useStoreStateReader([
    "isHTMLJSVersionSynced",
    "isAppUnlocked",
    "isIndexedDBReady",
    "isProductionBuild",
    "isRustInit",
    "dataBuildTime",
    "isDirtyState",
    "visibleTickerIds",
    "isOnline",
    "isProfilingCacheOverlayOpen",
    "isGAPageTrackingEnabled",
    "cacheDetails",
    "cacheSize",
    "rustServiceXHRRequestErrors",
    "subscribedMQTTRoomNames",
  ]);

  return (
    <Scrollable>
      <Padding>
        <Section>
          <h2>Session Sharing</h2>
          <Typography variant="body2" component="p">
            ETF Matcher doesn&apos;t use user accounts, but session data can be
            retained and shared with other devices in real-time.
          </Typography>
          <Typography variant="body2" component="p" mt={1}>
            Your devices can be linked using a common room name.
          </Typography>
          <Typography variant="body2" component="p" mt={1}>
            Multiple rooms can also be used simultaneously for different
            sessions.
          </Typography>

          <Box mt={2}>
            <SharedRoomManager />
          </Box>
        </Section>
      </Padding>

      <Padding>
        <UserDataSection />
      </Padding>

      <Padding>
        <Section>
          <h2>Rust Service Cache</h2>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={2}
          >
            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
              Cache size: {formatByteSize(cacheSize)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cache entries: {Object.keys(cacheDetails).length}
            </Typography>
          </Box>

          <LazyRender threshold={0.5}>
            <RustCachePieChart />
          </LazyRender>

          <div style={{ textAlign: "center" }}>
            <Section>
              <FormControlLabel
                control={
                  <Switch
                    checked={isProfilingCacheOverlayOpen}
                    onChange={() =>
                      store.setState(() => ({
                        isProfilingCacheOverlayOpen:
                          !isProfilingCacheOverlayOpen,
                      }))
                    }
                  />
                }
                label="Enable Cache Profiling Overlay"
              />
              <Button
                variant="contained"
                color="error"
                onClick={() => store.clearCache()}
                disabled={!Object.keys(cacheDetails).length}
              >
                Clear Cache
              </Button>
            </Section>
          </div>
        </Section>
      </Padding>

      <RustCacheTable />

      <Padding>
        <Section>
          <h2>Rust Service Errors</h2>
          {!Object.keys(rustServiceXHRRequestErrors).length ? (
            <div>No reported errors.</div>
          ) : (
            Object.keys(rustServiceXHRRequestErrors).map((pathName) => {
              const { errCount, lastTimestamp } =
                rustServiceXHRRequestErrors[pathName];
              return (
                <div key={pathName}>
                  {pathName}: {errCount} error(s) (last:{" "}
                  {formatLocalTime(lastTimestamp)})
                </div>
              );
            })
          )}
        </Section>
      </Padding>

      <Padding>
        <Section>
          <h2>Notifications</h2>
          <div>GA Events: {isGAPageTrackingEnabled ? "On" : "Off"}</div>
        </Section>
      </Padding>

      <Padding>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ float: "left" }}
        >
          {dataBuildTime
            ? `Data build time: ${formatLocalTime(dataBuildTime)}`
            : ""}
          {" | "}
          {isProductionBuild ? "PROD" : "DEV"}
          {" | "}
          {isHTMLJSVersionSynced
            ? `HTML/JS Versions Synced`
            : `HTML/JS Versions Not Synced`}
          {" | "}
          {isDirtyState ? "Not Saved" : "Saved"}
          {" | "}
          {isOnline ? "Online" : "Offline"}
          {" | "}
          {isAppUnlocked ? "Unlocked" : "Locked"}
          {" | "}
          {isRustInit ? "Rust Service Init" : "Rust Service Not Init"}
          {" | "}
          {isIndexedDBReady ? "IndexedDB Ready" : "IndexedDB Not Ready"}
          {" | "}
          Subscribed MQTT rooms: {subscribedMQTTRoomNames.length}
          {" | "}
          {visibleTickerIds?.toString()}
        </Typography>
      </Padding>
    </Scrollable>
  );
}