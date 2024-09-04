import React, { useCallback, useId } from "react";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import DialogModal from "@components/DialogModal";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import { tickerBucketsToCSV } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

export default function ImportExportDialogModal() {
  const { isImportExportModalOpen } = useStoreStateReader(
    "isImportExportModalOpen",
  );

  const handleClose = useCallback(() => {
    store.setState({ isImportExportModalOpen: false });
  }, []);

  const titleId = useId();
  const descriptionId = useId();

  const handleExport = useCallback(() => {
    // TODO: Refactor accordingly
    tickerBucketsToCSV().then((resp: string) => {
      customLogger.debug(resp);

      // Create a blob with the CSV content
      const blob = new Blob([resp], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const a = window.document.createElement("a");
      a.href = url;

      // TODO: Rename accordingly
      a.download = "export.csv"; // Name of the file

      window.document.body.appendChild(a); // Append the element to the body
      a.click(); // Trigger the download
      window.document.body.removeChild(a); // Remove the element after download
      URL.revokeObjectURL(url); // Release the URL object
    });
  }, []);

  return (
    <DialogModal
      open={isImportExportModalOpen}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>Import/Export</DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId}>
          <Button onClick={handleExport}>Proto::export()</Button>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error" variant="contained">
          Cancel
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
