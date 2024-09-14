import { useContext } from "react";

import { BucketImportExportContext } from "@providers/BucketImportExportProvider";

export default function useBucketImportExportContext() {
  const context = useContext(BucketImportExportContext);
  if (!context) {
    throw new Error(
      "useBucketImportExport must be used within a BucketImportExportProvider",
    );
  }
  return context;
}
