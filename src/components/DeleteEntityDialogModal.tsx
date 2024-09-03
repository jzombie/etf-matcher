import React from "react";

import DialogModal, { DialogModalProps } from "./DialogModal";

export type DeleteEntityDialogModalProps = DialogModalProps;

export default function DeleteEntityDialogModal({
  ...rest
}: DeleteEntityDialogModalProps) {
  return <DialogModal {...rest} />;
}
