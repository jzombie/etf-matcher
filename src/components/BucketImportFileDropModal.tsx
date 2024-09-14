import React from "react";

import TransparentModal, { TransparentModalProps } from "./TransparentModal";

export type BucketImportFileDropModalProps = Omit<
  TransparentModalProps,
  "children"
>;

export default function BucketImportFileDropModal({
  ...rest
}: BucketImportFileDropModalProps) {
  return <TransparentModal {...rest}>Hello world...</TransparentModal>;
}
