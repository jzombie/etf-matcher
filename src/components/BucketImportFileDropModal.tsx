import React, { useState } from "react";

import Full from "@layoutKit/Full";
import FileDragDropProvider from "@providers/FileDragDropProvider";

import customLogger from "@utils/customLogger";

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

  return (
    <FileDragDropProvider
      target={component || window}
      // TODO: Handle
      // onDragOver={(evt) => {
      //   customLogger.debug("drag over", evt);
      // }}
      // TODO: Handle
      onDragLeave={(evt) => {
        customLogger.debug("drag leave", evt);
      }}
      // TODO: Handle
      onDrop={(evt) => {
        customLogger.debug("drop", evt);
      }}
    >
      <TransparentModal {...rest}>
        {
          // TODO: Fix types
        }
        <Full ref={(component) => setComponent(component)}>test</Full>
      </TransparentModal>
    </FileDragDropProvider>
  );
}
