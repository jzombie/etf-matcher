import React, { useEffect, useState } from "react";

import Full from "@layoutKit/Full";

import TransparentModal, { TransparentModalProps } from "./TransparentModal";

export type BucketImportFileDropModalProps = Omit<
  TransparentModalProps,
  "children"
>;

export default function BucketImportFileDropModal({
  ...rest
}: BucketImportFileDropModalProps) {
  // TODO: Document why `useState` is used instead of `useRef` here (it's due to the modal dynamically rendering its children based on state)
  const [component, setComponent] = useState<HTMLDivElement | undefined>(
    undefined,
  );

  useEffect(() => {
    if (component) {
      console.log("yes, component");

      const handleDragOver = (event: DragEvent) => {
        console.log("drag over");

        // event.preventDefault(); // Prevent default to allow drop
      };

      const handleDragLeave = (event: DragEvent) => {
        console.log("drag leave");
      };

      const handleDrop = (event: DragEvent) => {
        console.log("drop");

        // event.preventDefault();
        // if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        //   handleFileDrop(event.dataTransfer.files); // Call the file drop handler
        //   openImportExportModal(); // Open the modal upon file drop
        // }
      };

      // Add event listeners for drag and drop
      component.addEventListener("dragover", handleDragOver);
      component.addEventListener("dragleave", handleDragLeave);
      component.addEventListener("drop", handleDrop);

      // Cleanup event listeners on unmount
      return () => {
        component.removeEventListener("dragover", handleDragOver);
        component.removeEventListener("dragleave", handleDragLeave);
        component.removeEventListener("drop", handleDrop);
      };
    } else {
      console.log("no...");
    }
  }, [component]);

  return (
    <TransparentModal {...rest}>
      {
        // TODO: Fix types
      }
      <Full ref={(component) => setComponent(component)}>test</Full>
    </TransparentModal>
  );
}
