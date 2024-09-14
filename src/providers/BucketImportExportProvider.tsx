import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
const BucketImportExportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);

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
      event.preventDefault(); // Prevent default to allow drop
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        handleFileDrop(event.dataTransfer.files); // Call the file drop handler
        openImportExportModal(); // Open the modal upon file drop
      }
    };

    // Add event listeners for drag and drop
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFileDrop, openImportExportModal]);

  return (
    <BucketImportExportContext.Provider
      value={{ openImportExportModal, closeImportExportModal, handleFileDrop }}
    >
      {children}

      {/* Conditionally render the modal */}
      <BucketImportExportDialogModal
        open={isImportExportModalOpen}
        onClose={closeImportExportModal}
      />
    </BucketImportExportContext.Provider>
  );
};

export default BucketImportExportProvider;
