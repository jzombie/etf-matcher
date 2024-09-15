import React, { createContext, useCallback, useEffect, useState } from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

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

  // Handle the drag-over state when the file is dragged within the app bounds
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      const prevIsDragOver = isDragOverCurrentRef.current;

      if (!prevIsDragOver) {
        setIsDragOver(true); // Drag is within bounds, show drop zone
      }

      event.preventDefault(); // Prevent default to allow the drag behavior
    };

    const handleDragLeave = (event: DragEvent) => {
      const { clientX, clientY } = event;

      // Determine if the drag has truly left the viewport
      const isOutsideBounds =
        clientX <= 0 ||
        clientY <= 0 ||
        clientX >= window.innerWidth ||
        clientY >= window.innerHeight;

      if (isOutsideBounds) {
        setIsDragOver(false); // Drag is out of bounds, hide drop zone
      }

      event.preventDefault();
      event.stopPropagation();
    };

    // Add event listeners for drag and drop
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, [isDragOverCurrentRef]);

  // FIXME: This is a workaround for Chrome 128 where when dragging a file over an iframe,
  // regardless if a div was covering the iframe, the iframe would cause the `dragleave` event
  // to emit on the parent. I didn't experience this issue when testing with Firefox or Safari.
  useEffect(() => {
    const iframes = Array.from(window.document.querySelectorAll("iframe")); // Convert NodeList to Array

    for (const iframe of iframes) {
      iframe.style.pointerEvents = isDragOver ? "none" : "auto"; // Disable or enable pointer events
    }

    return () => {
      // Cleanup: Re-enable pointer events when drag is over or component unmounts
      for (const iframe of iframes) {
        iframe.style.pointerEvents = "auto";
      }
    };
  }, [isDragOver]);

  return (
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
  );
}
