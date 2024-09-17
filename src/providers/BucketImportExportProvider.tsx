import React, { createContext, useCallback, useEffect, useState } from "react";

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
  isProcessingImport: boolean;
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
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);
  }, []);

  const importFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) {
        const errMessage = "No files selected";
        customLogger.error(errMessage);
        triggerUIError(new Error(errMessage));
        return;
      }

      customLogger.debug("import files...");
      customLogger.debug(`${fileList.length} total files`);

      // A 2-dimensional array of ticker buckets
      const fileResults: TickerBucket[][] = [];

      // Helper function to process a file and return a promise
      const processFile = (file: File) => {
        return new Promise<TickerBucket[]>((resolve, reject) => {
          const reader = new FileReader();

          // Log file metadata
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
                  resolve(resp); // Resolve with the result of csvToTickerBuckets
                })
                .catch((err) => {
                  reject(err); // Reject the promise if there was an error
                });
            } else {
              reject(new Error("Error reading file"));
            }
          };

          // Handle any error during file reading
          reader.onerror = (event) => {
            customLogger.error(
              `Error reading file ${file.name}:`,
              event.target?.error,
            );
            reject(event.target?.error || new Error("Error reading file"));
          };

          // Read the file as text (for CSV, text, etc.)
          reader.readAsText(file);
        });
      };

      setIsProcessingImport(true);

      // Process files one by one and await the results
      for (const file of Array.from(fileList)) {
        try {
          const result = await processFile(file);
          fileResults.push(result); // Store each result
        } catch (err) {
          customLogger.error(`Failed to process file: ${file.name}`, err);

          // FIXME: These errors may contain validation errors from the Rust service
          // and are currently echoing up verbatim to the UI, which isn't typical
          // of other implementations of this.
          if (err instanceof Error) {
            triggerUIError(err);
          } else {
            triggerUIError(new Error(err as string));
          }
        }
      }

      setIsProcessingImport(false);

      // After all files are processed
      customLogger.debug("All files processed:", fileResults);

      // Return the file results as an array
      return fileResults;
    },
    [triggerUIError],
  );

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

  // TODO: Remove
  useEffect(() => {
    customLogger.debug({ isProcessingImport });
  }, [isProcessingImport]);

  return (
    <BucketImportExportContext.Provider
      value={{
        openImportExportModal,
        closeImportExportModal,
        importFiles,
        exportFile,
        isProcessingImport,
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
