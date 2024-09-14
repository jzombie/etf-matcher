import React, { createContext, useCallback, useContext, useState } from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";

import customLogger from "@utils/customLogger";

// Define the context types
interface BucketImportExportContextType {
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
  handleFileDrop: (files: FileList) => void;
}

// Create the context
export const BucketImportExportContext = createContext<
  BucketImportExportContextType | undefined
>(undefined);

// Provider component
const BucketImportExportProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);

  const handleModalClose = useCallback(
    () => setImportExportModalOpen(false),
    [],
  );

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
        // TODO: Handle
        customLogger.debug(`File content: ${event.target?.result}`);
        // Handle the file content, e.g., parse CSV and update state
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <BucketImportExportContext.Provider
      value={{ openImportExportModal, closeImportExportModal, handleFileDrop }}
    >
      {children}

      {/* Conditionally render the modal */}
      <BucketImportExportDialogModal
        open={isImportExportModalOpen}
        onClose={handleModalClose}
      />
    </BucketImportExportContext.Provider>
  );
};

export default BucketImportExportProvider;
