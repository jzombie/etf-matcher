import React, { createContext, useCallback, useState } from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

import customLogger from "@utils/customLogger";

import FileDragDropProvider from "./FileDragDropProvider";

type BucketImportExportContextType = {
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
  importFiles: (fileList: FileList | null) => void;
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
      value={{ openImportExportModal, closeImportExportModal, importFiles }}
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
