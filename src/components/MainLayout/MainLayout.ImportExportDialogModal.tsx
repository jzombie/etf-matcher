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
          <Button
            onClick={() =>
              // TODO: Handle accordingly
              tickerBucketsToCSV().then((resp) => customLogger.debug(resp))
            }
          >
            Proto::export()
          </Button>
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
