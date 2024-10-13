import React, { createContext, useCallback, useEffect, useState } from "react";

import { TickerBucketSet } from "@services/TickerBucketImportExportService";
import store, { TickerBucket } from "@src/store";

import TickerBucketImportExportDialogModal from "@components/TickerBucketImportExport/TickerBucketImportExportDialogModal";
import TickerBucketImportFileDropModal from "@components/TickerBucketImportExport/TickerBucketImportFileDropModal";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import { useStateEmitterReader } from "@utils/StateEmitter";
import customLogger from "@utils/customLogger";

import FileDragDropProvider from "./FileDragDropProvider";

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

export type { TickerBucketSet };

export type TickerBucketImportExportProviderProps = {
  children: React.ReactNode;
};

export default function TickerBucketImportExportProvider({
  children,
}: TickerBucketImportExportProviderProps) {
  const tickerBucketImportExportService = store.tickerBucketImportExportService;

  const { mergeableSets, isProcessingImport } = useStateEmitterReader(
    tickerBucketImportExportService,
    ["mergeableSets", "isProcessingImport"],
  );

  const { triggerUIError } = useAppErrorBoundary();

  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
    tickerBucketImportExportService.clearMergeableSets();

    // Reset import error message
    setImportErrorMessage(null);
  }, [tickerBucketImportExportService]);

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
    (fileList: FileList | null) => {
      try {
        return tickerBucketImportExportService.readFiles(fileList);
      } catch (err) {
        handleVerbatimImportError(err);
      }
    },
    [tickerBucketImportExportService, handleVerbatimImportError],
  );

  const writeFile = useCallback(
    (filename: string, tickerBuckets: TickerBucket[]) => {
      try {
        return tickerBucketImportExportService.writeFile(
          filename,
          tickerBuckets,
        );
      } catch (err) {
        handleVerbatimImportError(err);
      }
    },
    [tickerBucketImportExportService, handleVerbatimImportError],
  );

  const handleDrop = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();

      const files = (evt.dataTransfer as DataTransfer).files;

      return readFiles(files);
    },
    [readFiles],
  );

  const importFilename = useCallback(
    (filename: string) => {
      tickerBucketImportExportService.importFilename(filename);
    },
    [tickerBucketImportExportService],
  );

  const getSameLocalBucket = useCallback(
    (
      tickerBucketType: TickerBucket["type"],
      tickerBucketName: TickerBucket["name"],
    ) =>
      tickerBucketImportExportService.getSameLocalBucket(
        tickerBucketType,
        tickerBucketName,
      ),
    [tickerBucketImportExportService],
  );

  // Helper function to get default filename based on current date & time
  const getDefaultExportFilename = useCallback(() => {
    return tickerBucketImportExportService.getDefaultExportFilename();
  }, [tickerBucketImportExportService]);

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
        onImportFilename: importFilename,
        getSameLocalBucket,
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
