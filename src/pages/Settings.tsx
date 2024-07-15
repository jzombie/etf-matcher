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

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Settings() {
  usePageTitleSetter("Settings");

  const {
    isGAPageTrackingEnabled,
    symbolBuckets,
    isProfilingCacheOverlayOpen,
    cacheDetails,
    cacheSize,
  } = useStoreStateReader([
    "isGAPageTrackingEnabled",
    "symbolBuckets",
    "isProfilingCacheOverlayOpen",
    "cacheDetails",
    "cacheSize",
  ]);

  return (
    <Scrollable>
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

      <Padding>
        <h2>Cache</h2>

        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
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
        <Button variant="outlined" onClick={() => store.PROTO_clearCache()}>
          PROTO_clearCache()
        </Button>

        <Button
          variant="outlined"
          onClick={() =>
            store.PROTO_removeCacheEntry("/data/symbol_search_dict.enc")
          }
        >
          PROTO_removeCacheEntry(/data/symbol_search_dict.enc)
        </Button>
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
    </Scrollable>
  );
}
