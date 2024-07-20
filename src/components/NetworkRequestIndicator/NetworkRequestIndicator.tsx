import React from "react";
import useStoreStateReader from "@hooks/useStoreStateReader";
import clsx from "clsx";
import styles from "./NetworkRequestIndicator.module.scss";

export type NetworkRequestIndicatorProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  showNetworkURL?: boolean;
};

export default function NetworkRequestNotifier({
  className,
  showNetworkURL = true,
  ...rest
}: NetworkRequestIndicatorProps) {
  const {
    latestXHROpenedRequestPathName,
    latestCacheOpenedRequestPathName,
    isOnline,
  } = useStoreStateReader([
    "latestXHROpenedRequestPathName",
    "latestCacheOpenedRequestPathName",
    "isOnline",
  ]);

  const networkURL =
    latestXHROpenedRequestPathName ||
    latestCacheOpenedRequestPathName ||
    (isOnline ? "Online" : "Offline");

  const indicatorClass = clsx({
    [styles.indicator]: true,
    [styles.xhr]: latestXHROpenedRequestPathName,
    [styles.cache]:
      latestCacheOpenedRequestPathName && !latestXHROpenedRequestPathName,
    [styles.online]:
      isOnline &&
      !latestXHROpenedRequestPathName &&
      !latestCacheOpenedRequestPathName,
    [styles.offline]: !isOnline,
  });

  return (
    <div className={clsx(styles.notifier, className)} {...rest}>
      <span className={indicatorClass} />
      {showNetworkURL && (
        <span className={styles.networkURL}>{networkURL}</span>
      )}
    </div>
  );
}
