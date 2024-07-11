import React from "react";
import { Button } from "antd";
import useStoreStateReader from "@hooks/useStoreStateReader";

export default function Settings() {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

  return (
    <div>
      <Button onClick={() => alert("TODO: Implement")}>Clear Data</Button>

      <div>
        <h2>Buckets</h2>

        {symbolBuckets?.map((symbolBucket, idx) => (
          <div key={idx}>{symbolBucket.name}</div>
        ))}
      </div>

      {
        // TODO: Add configuration options to adjust tickers which show in the ticker tape in the footer
      }
    </div>
  );
}
