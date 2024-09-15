import React, { createContext, useCallback, useState } from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

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

  // Function to open modal
  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  // Function to close modal
  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);
  }, []);

  return (
    <FileDragDropProvider onDragOverStateChange={setIsDragOver}>
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
