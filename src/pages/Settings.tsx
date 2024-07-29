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

import ProtoPieChart from "@components/PROTO_PieChart";
import ProtoTable from "@components/PROTO_Table";
import Section from "@components/Section";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

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
  ]);

  return (
    <Scrollable>
      <Padding>
        <Section>
          <h2>User Data</h2>

          <Button variant="outlined">
            TODO: Implement::Clear all user data
          </Button>

          <h3>Buckets</h3>

          {tickerBuckets?.map((tickerBucket, idx) => (
            <Typography key={idx} variant="body1">
              {tickerBucket.name}
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
        </Section>
      </Padding>

      <ProtoTable />

      <Padding style={{ textAlign: "center" }}>
        <Section>
          <FormControlLabel
            control={
              <Switch
                checked={isProfilingCacheOverlayOpen}
                onChange={() =>
                  store.setState(() => ({
                    isProfilingCacheOverlayOpen: !isProfilingCacheOverlayOpen,
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
          >
            Clear Cache
          </Button>
        </Section>
      </Padding>

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

          {visibleTickerIds?.toString()}
        </Typography>
      </Padding>
    </Scrollable>
  );
}
