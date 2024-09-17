import React, { createContext, useCallback, useState } from "react";

import type { TickerBucket } from "@src/store";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import { csvToTickerBuckets, tickerBucketsToCSV } from "@utils/callRustService";
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
  const { triggerUIError } = useAppErrorBoundary();

  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);
  }, []);

  const importFiles = useCallback((fileList: FileList | null) => {
    if (fileList) {
      customLogger.debug("import files...");

      // Iterate through the files in the FileList
      Array.from(fileList).forEach((file) => {
        const reader = new FileReader();

        // TODO: Prevent reading of large files, etc. Handle errors accordingly

        // Log file metadata (name, size, type)
        customLogger.debug(`File Name: ${file.name}`);
        customLogger.debug(`File Size: ${file.size} bytes`);
        customLogger.debug(`File Type: ${file.type}`);
        customLogger.debug(
          `Last Modified: ${new Date(file.lastModified).toLocaleString()}`,
        );

        // Set up the FileReader to read the file as text
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            csvToTickerBuckets(event.target.result as string)
              .then((resp) => {
                // TODO: Handle
                customLogger.debug({ resp });
              })
              .catch((err) => {
                triggerUIError(
                  new Error(
                    "Could not import an uploaded file. Perhaps the fields do not match the expected type?",
                  ),
                );

                customLogger.error(err);
              });
          }
        };

        // Handle any error during file reading
        reader.onerror = (event) => {
          customLogger.error(
            `Error reading file ${file.name}:`,
            event.target?.error,
          );
        };

        // Read the file as text (for CSV, text, etc.)
        reader.readAsText(file);
      });
    } else {
      customLogger.error("No files selected.");
    }
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
