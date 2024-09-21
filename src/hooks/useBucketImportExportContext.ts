import { useContext } from "react";

import { BucketImportExportContext } from "@providers/TickerBucketImportExportProvider";

export default function useBucketImportExportContext() {
  const context = useContext(BucketImportExportContext);
  if (!context) {
    throw new Error(
      "useBucketImportExport must be used within a TickerBucketImportExportProvider",
    );
  }
  return context;
}
