import React from "react";

import Center from "@layoutKit/Center";
import Full from "@layoutKit/Full";

import TransparentModal, { TransparentModalProps } from "./TransparentModal";

export type BucketImportFileDropModalProps = Omit<
  TransparentModalProps,
  "children"
>;

const BORDER_INSET: number = 16;

export default function BucketImportFileDropModal({
  ...rest
}: BucketImportFileDropModalProps) {
  return (
    <TransparentModal {...rest}>
      <Full style={{ padding: BORDER_INSET }}>
        <Full
          style={{
            border: "8px dashed #cccccc",
            textAlign: "center",
          }}
        >
          {
            // TODO: Finish implementing
          }
          <Center>[File Drop]</Center>
        </Full>
      </Full>
    </TransparentModal>
  );
}
