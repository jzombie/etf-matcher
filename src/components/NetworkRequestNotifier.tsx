import React from "react";
import useStoreStateReader from "@hooks/useStoreStateReader";

export type NetworkRequestNotifierProps = React.HTMLAttributes<HTMLElement>;

export default function NetworkRequestNotifier({
  ...rest
}: NetworkRequestNotifierProps) {
  const { latestXHROpenedRequestPathName, latestCacheOpenedRequestPathName } =
    useStoreStateReader([
      "latestXHROpenedRequestPathName",
      "latestCacheOpenedRequestPathName",
    ]);

  // TODO: Improve layout
  return (
    <div {...rest}>
      {latestXHROpenedRequestPathName}
      {latestCacheOpenedRequestPathName}
    </div>
  );
}
