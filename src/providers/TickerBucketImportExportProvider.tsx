import React, { createContext, useCallback, useEffect, useState } from "react";

import { MAX_CSV_IMPORT_SIZE, PROJECT_NAME } from "@src/constants";
import type { TickerBucket } from "@src/store";
import store from "@src/store";

import TickerBucketImportExportDialogModal from "@components/TickerBucketImportExport/TickerBucketImportExportDialogModal";
import TickerBucketImportFileDropModal from "@components/TickerBucketImportExport/TickerBucketImportFileDropModal";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import { csvToTickerBuckets, tickerBucketsToCSV } from "@utils/callRustService";
import customLogger from "@utils/customLogger";
import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

import FileDragDropProvider from "./FileDragDropProvider";

export type TickerBucketSet = {
  filename: string;
  buckets: TickerBucket[];
};

type TickerBucketImportExportContextType = {
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
  readFiles: (fileList: FileList | null) => void;
  writeFile: (filename: string, tickerBuckets: TickerBucket[]) => void;
  isProcessingImport: boolean;
  mergeableSets: TickerBucketSet[] | null;
  getDefaultExportFilename: () => string;
  importErrorMessage: string | null;
  onImportFilename: (filename: string) => void;
  getSameLocalBucket: (
    tickerBucketType: TickerBucket["type"],
    tickerBucketName: TickerBucket["name"],
  ) => TickerBucket | undefined;
};

export const TickerBucketImportExportContext = createContext<
  TickerBucketImportExportContextType | undefined
>(undefined);

export type TickerBucketImportExportProviderProps = {
  children: React.ReactNode;
};

export default function TickerBucketImportExportProvider({
  children,
}: TickerBucketImportExportProviderProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const [mergeableSets, setMergeableSets] = useState<TickerBucketSet[] | null>(
    null,
  );

  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(
    null,
  );

  // Open `import/export` modal if there are mergeable sets
  useEffect(() => {
    if (mergeableSets) {
      setImportExportModalOpen(true);
    }
  }, [mergeableSets]);

  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);

    // Clear out mergeable sets
    setMergeableSets(null);

    // Reset import error message
    setImportErrorMessage(null);
  }, []);

  // Note: These errors may contain validation errors from the Rust service
  // and are currently echoing up verbatim to the UI, which isn't typical
  // of other implementations of this.
  const handleVerbatimImportError = useCallback(
    (err: Error | string | unknown) => {
      customLogger.error(err);
      if (err instanceof Error) {
        triggerUIError(err);
        setImportErrorMessage(err.message);
      } else if (typeof err === "string") {
        triggerUIError(new Error(err));
        setImportErrorMessage(err);
      } else {
        const genericError = "An unexpected error occurred.";
        customLogger.error("Unknown error type:", err);
        triggerUIError(new Error(genericError));
        setImportErrorMessage(genericError);
      }
    },
    [triggerUIError],
  );

  const readFiles = useCallback(
    async (fileList: FileList | null) => {
      setImportErrorMessage(null);

      if (!fileList) {
        const errMessage = "No files selected";
        customLogger.error(errMessage);
        triggerUIError(new Error(errMessage));
        return;
      }

      customLogger.debug("import files...");
      customLogger.debug(`${fileList.length} total files`);

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

          if (file.size > MAX_CSV_IMPORT_SIZE) {
            throw new Error(
              `Uploaded file larger than ${formatNumberWithCommas(MAX_CSV_IMPORT_SIZE)} bytes`,
            );
          }

          // Set up the FileReader to read the file as text
          reader.onload = (event) => {
            if (event.target?.result) {
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

      const fileResults: TickerBucketSet[] = await Promise.all(
        Array.from(fileList).map(async (file) => {
          try {
            const result = await processFile(file);
            // Associate the filename with the buckets
            return {
              filename: file.name,
              buckets: result,
            };
          } catch (err) {
            handleVerbatimImportError(err);

            // Abruptly stop if there is an error when processing any file.
            // This is the expected behavior for this operation.
            throw err;
          }
        }),
      );

      setIsProcessingImport(false);

      // After all files are processed
      customLogger.debug("All files processed:", fileResults);

      // Set the mergeable sets to include an ID
      setMergeableSets(fileResults);

      // Return the file results as an array
      return fileResults;
    },
    [handleVerbatimImportError, triggerUIError],
  );

  const writeFile = useCallback(
    (filename: string, tickerBuckets: TickerBucket[]) => {
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
      readFiles(files);
    },
    [readFiles],
  );

  const getSameLocalBucket = useCallback(
    (
      tickerBucketType: TickerBucket["type"],
      tickerBucketName: TickerBucket["name"],
    ) => {
      // Use `type` and `name` instead of `uuid` to enable buckets to be
      // imported across sessions without raising validation errors for
      // non-unique UUIDs
      return store.getTickerBucketWithTypeAndName(
        tickerBucketType,
        tickerBucketName,
      );
    },
    [],
  );

  // This performs the "final merge", writing the new data to the store
  const handleImportFilename = useCallback(
    (filename: string) => {
      try {
        const mergeableSet = mergeableSets?.find(
          ({ filename: predicateFilename }) => filename === predicateFilename,
        );

        if (!mergeableSet) {
          throw new Error(
            `Could not locate mergeable set for filename: ${filename}`,
          );
        }

        const incomingTickerBuckets = mergeableSet.buckets;

        for (const incomingBucket of incomingTickerBuckets) {
          const currentBucket = getSameLocalBucket(
            incomingBucket.type,
            incomingBucket.name,
          );

          if (currentBucket) {
            store.updateTickerBucket(currentBucket, incomingBucket);
          } else {
            store.createTickerBucket(incomingBucket);
          }
        }

        // Remove the filename from the mergeable sets
        setMergeableSets(
          (prev) =>
            prev?.filter(
              ({ filename: predicateFilename }) =>
                filename !== predicateFilename,
            ) || null,
        );
      } catch (err) {
        handleVerbatimImportError(err);
        throw err;
      }
    },
    [mergeableSets, getSameLocalBucket, handleVerbatimImportError],
  );

  // Helper function to get default filename based on current date & time
  const getDefaultExportFilename = useCallback(() => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-"); // Format: YYYY-MM-DDTHH-MM-SS
    return `${PROJECT_NAME.toLowerCase().replaceAll(" ", "-")}-${timestamp}.csv`;
  }, []);

  return (
    <TickerBucketImportExportContext.Provider
      value={{
        openImportExportModal,
        closeImportExportModal,
        readFiles,
        writeFile,
        isProcessingImport,
        mergeableSets,
        getDefaultExportFilename,
        importErrorMessage,
        onImportFilename: handleImportFilename,
        getSameLocalBucket: getSameLocalBucket,
      }}
    >
      <FileDragDropProvider
        onDragOverStateChange={setIsDragOver}
        onDrop={handleDrop}
      >
        {children}

        <TickerBucketImportExportDialogModal
          open={isImportExportModalOpen}
          onClose={closeImportExportModal}
        />

        <TickerBucketImportFileDropModal open={isDragOver} />
      </FileDragDropProvider>
    </TickerBucketImportExportContext.Provider>
  );
}
