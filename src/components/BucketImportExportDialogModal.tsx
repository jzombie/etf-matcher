import React, { useCallback, useId, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { FILE_IMPORT_ACCEPT_MAP } from "@src/constants";
import store from "@src/store";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import useBucketImportExportContext from "@hooks/useBucketImportExportContext";

import TickerBucketMergeDiff from "./TickerBucketMergeDiff";

export type BucketImportExportDialogModalProps = Omit<
  DialogModalProps,
  "children"
>;

export default function BucketImportExportDialogModal({
  onClose,
  ...rest
}: BucketImportExportDialogModalProps) {
  // Helper function to get default filename based on current date & time
  const getDefaultFileName = useCallback(() => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-"); // Format: YYYY-MM-DDTHH-MM-SS
    return `export-${timestamp}.csv`;
  }, []);

  const { importFiles, exportFile, mergeableSets } =
    useBucketImportExportContext();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileName, setFileName] = useState<string>(getDefaultFileName());
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null); // Track the selected set
  const selectedSet = useMemo(() => {
    return mergeableSets?.find(({ filename }) => filename === selectedFilename);
  }, [selectedFilename, mergeableSets]);

  // Handle export
  const handleExport = useCallback(() => {
    const userConfigurableTickerBuckets =
      store.getUserConfigurableTickerBuckets();

    exportFile(fileName || getDefaultFileName(), userConfigurableTickerBuckets);
  }, [exportFile, fileName, getDefaultFileName]);

  // Handle file selection for import
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

  const titleId = useId();
  const descriptionId = useId();
  const fileInputId = useId();

  // Form submission handler to prevent default behavior
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      // This is a no-op
      event.preventDefault();
    },
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
      <Alert severity="warning">
        This feature is currently being worked on and is not fully wired up.
      </Alert>

      {/* Wrap content in form to handle form-level behavior */}
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth>
          {/* If there are no mergeable sets, show import/export options */}
          {!mergeableSets ? (
            <DialogContent>
              <Box mt={1}>
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

                <Divider sx={{ margin: 2 }} />

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
                  onClick={() =>
                    window.document.getElementById(fileInputId)?.click()
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
              </Box>
            </DialogContent>
          ) : (
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Select a File to Merge or Overwrite
              </Typography>
              <Select
                fullWidth
                value={selectedFilename || ""}
                onChange={(e) => setSelectedFilename(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a file
                </MenuItem>
                {mergeableSets.map((set) => (
                  <MenuItem key={set.filename} value={set.filename}>
                    {set.filename} ({set.buckets.length} Bucket
                    {set.buckets.length !== 1 ? "s" : ""})
                  </MenuItem>
                ))}
              </Select>
              {selectedSet?.buckets.map((bucket) => (
                <TickerBucketMergeDiff
                  key={bucket.uuid}
                  incomingBucket={bucket}
                />
              ))}
            </DialogContent>
          )}
        </FormControl>

        <DialogActions>
          <Button onClick={onClose} color="error" variant="contained">
            Close
          </Button>
        </DialogActions>
      </form>
    </DialogModal>
  );
}
