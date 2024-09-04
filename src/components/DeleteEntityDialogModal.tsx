import React, { useId } from "react";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import DialogModal, { DialogModalProps } from "./DialogModal";

export type DeleteEntityDialogModalProps = Omit<
  DialogModalProps,
  "children"
> & {
  // Use the `onClose` type for `onCancel` and `onDelete`
  onCancel: DialogModalProps["onClose"];
  onDelete: DialogModalProps["onClose"];
  title: string | React.ReactNode;
  content: string | React.ReactNode;
};

export default function DeleteEntityDialogModal({
  open,
  onClose,
  onCancel,
  onDelete,
  title,
  content,
}: DeleteEntityDialogModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId}>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onDelete} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
