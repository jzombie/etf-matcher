import React, { SyntheticEvent } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export type DialogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (event: SyntheticEvent) => void;
  actionDisabled?: boolean;
  actionLabel?: string;
  cancelLabel?: string;
  children?: React.ReactNode;
};

export default function DialogModal({
  isOpen,
  onClose,
  onAction,
  actionDisabled,
  actionLabel = "OK",
  cancelLabel = "Cancel",
  children,
}: DialogModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: "100vw", // Full width for extra small screens
            sm: "50vw", // 50% width for small screens and up
          },
          maxWidth: {
            xs: "100vw", // Full width for extra small screens
            sm: "500px", // Max width of 500px for small screens and up
          },
          minWidth: "300px",
          height: {
            xs: "100vh", // Full height for extra small screens
            sm: "60vh", // 60% height for small screens and up
          },
          minHeight: 300,
          maxHeight: "80vh",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          "@media (max-width: 728px)": {
            width: "100vw",
            height: "100dvh", // Assuming the browser supports `dvh`
            maxWidth: "100vw",
            maxHeight: "100dvh", // Assuming the browser supports `dvh`
            border: "none",
            borderRadius: 0,
          },
        },
      }}
    >
      {children}

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          variant={!actionDisabled ? "contained" : "text"}
          color="error"
        >
          {cancelLabel}
        </Button>
        {onAction && (
          <Button
            onClick={onAction}
            disabled={actionDisabled}
            variant="contained"
          >
            {actionLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
