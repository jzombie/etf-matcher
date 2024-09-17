import React, { createContext, useCallback, useState } from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

import customLogger from "@utils/customLogger";

import FileDragDropProvider from "./FileDragDropProvider";

type BucketImportExportContextType = {
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
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

  const handleDrop = useCallback((evt: DragEvent) => {
    evt.preventDefault(); // Prevent default browser behavior (e.g., opening the file)

    const { files } = evt.dataTransfer as DataTransfer;

    // TODO: Unify file handling to work consistently with drag and manual file selection
    if (files && files.length > 0) {
      // Iterate through the files and log their metadata
      Array.from(files).forEach((file) => {
        customLogger.debug("-----");
        customLogger.debug("File Name:", file.name);
        customLogger.debug("File Size:", file.size);
        customLogger.debug("File Type:", file.type);
        customLogger.debug("Last Modified:", file.lastModified);
      });
    } else {
      customLogger.warn("No files detected in the drop event");
    }
  }, []);

  return (
    <FileDragDropProvider
      onDragOverStateChange={setIsDragOver}
      onDrop={handleDrop}
    >
      <BucketImportExportContext.Provider
        value={{ openImportExportModal, closeImportExportModal }}
      >
        {children}

        <BucketImportExportDialogModal
          open={isImportExportModalOpen}
          onClose={closeImportExportModal}
        />

        <BucketImportFileDropModal open={isDragOver} />
      </BucketImportExportContext.Provider>
    </FileDragDropProvider>
  );
}
