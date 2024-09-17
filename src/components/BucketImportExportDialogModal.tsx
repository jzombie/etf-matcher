import React, { useCallback, useId, useMemo, useState } from "react";

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import { FILE_IMPORT_ACCEPT_MAP } from "@src/constants";
import store from "@src/store";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import useBucketImportExportContext from "@hooks/useBucketImportExportContext";

export type BucketImportExportDialogModalProps = Omit<
  DialogModalProps,
  "children"
>;

export default function BucketImportExportDialogModal({
  onClose,
  ...rest
}: BucketImportExportDialogModalProps) {
  const { importFiles, exportFile } = useBucketImportExportContext();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileName, setFileName] = useState<string>(getDefaultFileName());

  const titleId = useId();
  const descriptionId = useId();
  const fileInputId = useId();

  // Helper function to get default filename based on current date & time
  function getDefaultFileName(): string {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-"); // Format: YYYY-MM-DDTHH-MM-SS
    return `export-${timestamp}.csv`;
  }

  const handleExport = useCallback(() => {
    // Only export user-configurable buckets
    const tickerBuckets = store.state.tickerBuckets.filter(
      (tickerBucket) => tickerBucket.isUserConfigurable,
    );

    exportFile(tickerBuckets, fileName || getDefaultFileName());
  }, [exportFile, fileName]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      setSelectedFiles(files);
      importFiles(files);
    },
    [importFiles],
  );

  const extensionTypes = useMemo(
    () => FILE_IMPORT_ACCEPT_MAP.get("csv")?.mimeTypes.join(", "),
    [],
  );

  return (
    <DialogModal
      {...rest}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>Import/Export</DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId}>
          Choose a file to import or export your data.
        </DialogContentText>

        {/* Filename input */}
        <TextField
          label="Filename"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Export Button */}
        <Button
          onClick={handleExport}
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
        >
          Export Data
        </Button>

        {/* Custom File Upload Button */}
        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: "4px",
            padding: "16px",
            textAlign: "center",
            cursor: "pointer",
            mb: 2,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,.2)",
            },
          }}
          onClick={
            () =>
              window.document
                .getElementById(fileInputId)
                ?.click() /* Trigger file input click */
          }
        >
          <Typography variant="body2">
            {selectedFiles
              ? `${selectedFiles.length} file(s) selected`
              : "Drag and drop files here or click to select"}
          </Typography>
        </Box>

        {/* Hidden File Input */}
        <input
          id={fileInputId}
          type="file"
          accept={extensionTypes}
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">
          Close
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
