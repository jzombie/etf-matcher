import React from "react";
import { Button, Switch, FormControlLabel } from "@mui/material";

import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import ProtoPieChart from "@components/PROTO_PieChart";
import ProtoTable from "@components/PROTO_Table";

export default function Settings() {
  const {
    symbolBuckets,
    isProfilingCacheOverlayOpen,
    cacheDetails,
    cacheSize,
  } = useStoreStateReader([
    "symbolBuckets",
    "isProfilingCacheOverlayOpen",
    "cacheDetails",
    "cacheSize",
  ]);

  // const [api, contextHolder] = notification.useNotification();

  // TODO: Refactor into a system that can be called directly from the store
  /*
  const openNotification = () => {
    const key = `open${Date.now()}`;
    const btn = (
      <Space>
        <Button type="link" size="small" onClick={() => api.destroy()}>
          Destroy All
        </Button>
        <Button type="primary" size="small" onClick={() => api.destroy(key)}>
          Confirm
        </Button>
      </Space>
    );
    api.open({
      message: "Notification Title",
      description:
        'A function will be be called after the notification is closed (automatically after the "duration" time of manually).',
      btn,
      key,
      // placement: "top",
      // onClose: close,
    });
  };
  */

  return (
    <Scrollable>
      <Padding>
        <h2>User Data</h2>

        <Button variant="outlined">TODO: Implement::Clear all user data</Button>

        <h3>Buckets</h3>

        {symbolBuckets?.map((symbolBucket, idx) => (
          <div key={idx}>{symbolBucket.name}</div>
        ))}
      </Padding>
      <Padding>
        <h2>Cache</h2>

        <h3>View</h3>

        <div>Cache size: {cacheSize}</div>
        <div>Cache entries: {Object.keys(cacheDetails).length}</div>

        {
          // TODO: Don't render until in view (to get nice transition-in effect)
        }
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
        <h3>Purge</h3>

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
        <h2>Prototype Notifications</h2>

        <>
          {
            // contextHolder
          }
          {/*
          <Button type="primary" onClick={openNotification}>
          Open the notification box
        </Button>
          */}
        </>

        {
          // TODO: Add configuration options to adjust tickers which show in the ticker tape in the footer
        }
      </Padding>
    </Scrollable>
  );
}
