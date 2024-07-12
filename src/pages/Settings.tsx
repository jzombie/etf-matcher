import React from "react";
import { Button } from "@mui/material";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

export default function Settings() {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

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
    <div>
      <Button variant="outlined">TODO: Implement::Clear Data</Button>

      <Button variant="outlined" onClick={() => store.PROTO_getCacheSize()}>
        PROTO_getCacheSize()
      </Button>

      <Button variant="outlined" onClick={() => store.PROTO_getCacheDetails()}>
        PROTO_getCacheDetails()
      </Button>

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

      <div>
        <h2>Buckets</h2>

        {symbolBuckets?.map((symbolBucket, idx) => (
          <div key={idx}>{symbolBucket.name}</div>
        ))}
      </div>

      <hr />

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
    </div>
  );
}
