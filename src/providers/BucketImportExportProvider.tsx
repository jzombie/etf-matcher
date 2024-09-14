import React, { createContext, useCallback, useEffect, useState } from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import TransparentModal from "@components/TransparentModal";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

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

  const isDragOverCurrentRef = useStableCurrentRef(isDragOver);

  // Function to open modal
  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  // Function to close modal
  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);
  }, []);

  // Handle file drop
  const handleFileDrop = useCallback((files: FileList) => {
    const file = files[0]; // Assumes single file drop for simplicity
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // TODO: Handle file content
        customLogger.debug(`File content: ${event.target?.result}`);
        // Handle the file content, e.g., parse CSV and update state
      };
      reader.readAsText(file);
    }
  }, []);

  // Effect to handle drag-and-drop events
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      const prevIsDragOver = isDragOverCurrentRef.current;
      if (!prevIsDragOver) {
        setIsDragOver(true);
      }

      event.preventDefault(); // Prevent default to allow drop
    };

    const handleDragLeave = (event: DragEvent) => {
      setIsDragOver(false);

      event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        handleFileDrop(event.dataTransfer.files); // Call the file drop handler
        openImportExportModal(); // Open the modal upon file drop
      }

      setIsDragOver(false);
    };

    // Add event listeners for drag and drop
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFileDrop, openImportExportModal, isDragOverCurrentRef]);

  // TODO: Remove
  useEffect(() => {
    customLogger.debug({ isDragOver });
  }, [isDragOver]);

  // TODO: Render "drop zone" when dragging a file in

  return (
    <BucketImportExportContext.Provider
      value={{ openImportExportModal, closeImportExportModal }}
    >
      {children}

      <BucketImportExportDialogModal
        open={isImportExportModalOpen}
        onClose={closeImportExportModal}
      />

      <TransparentModal open={isDragOver}>
        <div>HELLO</div>
      </TransparentModal>
    </BucketImportExportContext.Provider>
  );
}
