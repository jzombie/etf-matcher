import React, { createContext, useCallback, useState } from "react";

import type { TickerBucket } from "@src/store";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

import { tickerBucketsToCSV } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

import FileDragDropProvider from "./FileDragDropProvider";

type BucketImportExportContextType = {
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
  importFiles: (fileList: FileList | null) => void;
  exportFile: (tickerBuckets: TickerBucket[], filename: string) => void;
};

export const BucketImportExportContext = createContext<
  BucketImportExportContextType | undefined
>(undefined);

export type BucketImportExportProviderProps = {
  children: React.ReactNode;
};

export default function BucketImportExportProvider({
  children,
}: BucketImportExportProviderProps) {
  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);
  }, []);

  const importFiles = useCallback((fileList: FileList | null) => {
    // TODO: Handle
    customLogger.debug("import files...");
    customLogger.debug(fileList);
  }, []);

  const exportFile = useCallback(
    (tickerBuckets: TickerBucket[], filename: string) => {
      tickerBucketsToCSV(tickerBuckets).then((resp: string) => {
        customLogger.debug(resp);

        // Create a blob with the CSV content
        const blob = new Blob([resp], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a link element and trigger a download
        const a = window.document.createElement("a");
        a.href = url;

        a.download = filename;

        window.document.body.appendChild(a); // Append the element to the body
        a.click(); // Trigger the download
        window.document.body.removeChild(a); // Remove the element after download
        URL.revokeObjectURL(url); // Release the URL object
      });
    },
    [],
  );

  const handleDrop = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();

      const files = (evt.dataTransfer as DataTransfer).files;
      importFiles(files);
    },
    [importFiles],
  );

  return (
    <BucketImportExportContext.Provider
      value={{
        openImportExportModal,
        closeImportExportModal,
        importFiles,
        exportFile,
      }}
    >
      <FileDragDropProvider
        onDragOverStateChange={setIsDragOver}
        onDrop={handleDrop}
      >
        {children}

        <BucketImportExportDialogModal
          open={isImportExportModalOpen}
          onClose={closeImportExportModal}
        />

        <BucketImportFileDropModal open={isDragOver} />
      </FileDragDropProvider>
    </BucketImportExportContext.Provider>
  );
}
