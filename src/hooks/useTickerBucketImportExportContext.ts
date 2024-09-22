import { useContext } from "react";

import { TickerBucketImportExportContext } from "@providers/TickerBucketImportExportProvider";

export default function useTickerBucketImportExportContext() {
  const context = useContext(TickerBucketImportExportContext);
  if (!context) {
    throw new Error(
      "`useTickerBucketImportExportContext` must be used within a `TickerBucketImportExportContext`",
    );
  }
  return context;
}
