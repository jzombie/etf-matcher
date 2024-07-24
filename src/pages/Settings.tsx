import React from "react";
import {
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";

import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";

import ProtoPieChart from "@components/PROTO_PieChart";
import ProtoTable from "@components/PROTO_Table";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import formatByteSize from "@utils/formatByteSize";
import formatLocalTime from "@utils/formatLocalTime";

import usePageTitleSetter from "@utils/usePageTitleSetter";

import callRustService from "@utils/callRustService";

export default function Settings() {
  usePageTitleSetter("Settings");

  const {
    isHTMLJSVersionSynced,
    isAppUnlocked,
    isProductionBuild,
    isRustInit,
    prettyDataBuildTime,
    isDirtyState,
    visibleSymbols,
    isOnline,
    isProfilingCacheOverlayOpen,
    isGAPageTrackingEnabled,
    symbolBuckets,
    cacheDetails,
    cacheSize,
    rustServiceXHRRequestErrors,
  } = useStoreStateReader([
    "isHTMLJSVersionSynced",
    "isAppUnlocked",
    "isProductionBuild",
    "isRustInit",
    "prettyDataBuildTime",
    "isDirtyState",
    "visibleSymbols",
    "isOnline",
    "isProfilingCacheOverlayOpen",
    "isGAPageTrackingEnabled",
    "symbolBuckets",
    "cacheDetails",
    "cacheSize",
    "rustServiceXHRRequestErrors",
  ]);

  return (
    <Scrollable>
      <Padding>
        <h2>Prototype</h2>

        {
          // TODO: Remove
        }
        <Button
          onClick={() =>
            callRustService("get_ticker_etf_holders", [3416, 1, 20]).then(
              console.debug
            )
          }
        >
          PROTO::get_ticker_etf_holders
        </Button>
      </Padding>

      <Padding>
        <h2>User Data</h2>

        <Button variant="outlined">TODO: Implement::Clear all user data</Button>

        <h3>Buckets</h3>

        {symbolBuckets?.map((symbolBucket, idx) => (
          <Typography key={idx} variant="body1">
            {symbolBucket.name}
          </Typography>
        ))}
      </Padding>

      <div>
        <Padding>
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
        </Padding>

        <ProtoTable />

        <Padding>
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
        </Padding>

        <Padding>
          <Button
            variant="contained"
            color="error"
            onClick={() => store.PROTO_clearCache()}
          >
            Clear Cache
          </Button>
        </Padding>
      </div>

      <Padding>
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
      </Padding>

      <Padding>
        <h2>Notifications</h2>

        <div>GA Events: {isGAPageTrackingEnabled ? "On" : "Off"}</div>

        {
          // Add prototype notifications code here
        }

        {
          // TODO: Add configuration options to adjust tickers which show in the ticker tape in the footer
        }
      </Padding>

      <Padding>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ float: "left" }}
        >
          {prettyDataBuildTime ? `Data build time: ${prettyDataBuildTime}` : ""}
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
          {visibleSymbols?.toString()}
        </Typography>
      </Padding>
    </Scrollable>
  );
}
