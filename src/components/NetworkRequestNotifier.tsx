import React from "react";
import useStoreStateReader from "@hooks/useStoreStateReader";

export default function NetworkRequestNotifier() {
  const { latestXHROpenedRequestPathName, latestCacheOpenedRequestPathName } =
    useStoreStateReader([
      "latestXHROpenedRequestPathName",
      "latestCacheOpenedRequestPathName",
    ]);

  // TODO: Improve layout
  return (
    <div>
      {latestXHROpenedRequestPathName} | {latestCacheOpenedRequestPathName}
    </div>
  );
}
