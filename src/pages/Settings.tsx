import React, { useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import ProtoPieChart from "@components/PROTO_PieChart";
import ProtoTable from "@components/PROTO_Table";
import Section from "@components/Section";
import SharedRoomManager from "@components/SharedRoomManager";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import customLogger from "@utils/customLogger";
import formatByteSize from "@utils/formatByteSize";
import formatLocalTime from "@utils/formatLocalTime";
import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Settings() {
  usePageTitleSetter("Settings");

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
    tickerBuckets,
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
    "tickerBuckets",
    "cacheDetails",
    "cacheSize",
    "rustServiceXHRRequestErrors",
    "subscribedMQTTRoomNames",
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmReset = () => {
    store.reset();
    setIsDialogOpen(false);
  };

  return (
    <Scrollable>
      <Padding>
        <Section>
          <Button
            onClick={() =>
              store
                .fetchETFHoldingsByETFTickerId(118101)
                .then(customLogger.debug)
            }
          >
            Proto::fetchETFHoldingsByETFTickerId()
          </Button>
          <Button
            onClick={() =>
              store.fetchTicker10KDetail(6195).then(customLogger.debug)
            }
          >
            Proto::fetchTicker10KDetail()
          </Button>
        </Section>
      </Padding>

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
        <Section>
          <h2>User Data</h2>
          <Button variant="contained" color="error" onClick={handleOpenDialog}>
            Clear User Data
          </Button>
          <h3>Buckets</h3>
          {tickerBuckets?.map((tickerBucket, idx) => (
            <Typography key={idx} variant="body1">
              {tickerBucket.name}: {tickerBucket.tickers.length} items
            </Typography>
          ))}
        </Section>
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

          <ProtoPieChart />

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

      <ProtoTable />

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
          {
            // Add prototype notifications code here
          }
          {
            // TODO: Add configuration options to adjust tickers which show in the ticker tape in the footer
          }
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

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Reset</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to clear all user data? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmReset} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Scrollable>
  );
}
