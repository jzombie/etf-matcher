import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

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

import Center from "@layoutKit/Center";
import { FILE_IMPORT_ACCEPT_MAP } from "@src/constants";
import store from "@src/store";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import useBucketImportExportContext from "@hooks/useBucketImportExportContext";

import TickerBucketMergeDiff from "./TickerBucketMergeDiff";

export type TickerBucketImportExportDialogModalProps = Omit<
  DialogModalProps,
  "children"
>;

export default function TickerBucketImportExportDialogModal({
  open: isOpen,
  onClose,
  ...rest
}: TickerBucketImportExportDialogModalProps) {
  const {
    importFiles,
    exportFile,
    mergeableSets,
    getDefaultExportFilename,
    importErrorMessage,
    onImportFilename,
  } = useBucketImportExportContext();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [exportFilename, setExportFilename] = useState<string>(
    getDefaultExportFilename(),
  );
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null); // Track the selected set
  const selectedSet = useMemo(() => {
    return mergeableSets?.find(({ filename }) => filename === selectedFilename);
  }, [selectedFilename, mergeableSets]);

  const reset = useCallback(() => {
    setSelectedFiles(null);
    setSelectedFilename(null);
    // setExportFilename(getDefaultExportFilename()); // Leave this alone for now
  }, []);

  // Reset fields when modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    // Reset selected files when `mergeableSets` changes
    setSelectedFiles(null);

    // Auto-select filename if only one imported file
    if (mergeableSets?.length === 1) {
      setSelectedFilename(mergeableSets[0].filename);
    }
  }, [mergeableSets]);

  // Handle export
  const handleExport = useCallback(() => {
    const userConfigurableTickerBuckets =
      store.getUserConfigurableTickerBuckets();

    exportFile(
      exportFilename || getDefaultExportFilename(),
      userConfigurableTickerBuckets,
    );
  }, [exportFile, exportFilename, getDefaultExportFilename]);

  // Handle file selection for import
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      setSelectedFiles(files);
      importFiles(files);
    },
    [importFiles],
  );

  // Form submission handler to prevent default behavior
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      // This is a no-op
      event.preventDefault();
    },
    [],
  );

  // Formatted for `input[type="file"]` element
  const extensionTypes = useMemo(
    () => FILE_IMPORT_ACCEPT_MAP.get("csv")?.mimeTypes.join(", "),
    [],
  );

  const titleId = useId();
  const descriptionId = useId();
  const fileInputId = useId();

  return (
    <DialogModal
      {...rest}
      open={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>Import/Export</DialogTitle>
      <Alert severity="warning">
        This feature is currently being worked on and is not fully wired up.
      </Alert>

      {importErrorMessage && (
        <Alert severity="error">
          An error occurred when importing a CSV:
          <br />
          {importErrorMessage}
        </Alert>
      )}

      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Wrap content in form to handle form-level behavior */}

          <FormControl fullWidth>
            {/* If there are no mergeable sets, show import/export options */}
            {mergeableSets === null ? (
              <>
                <Box mt={1}>
                  {/* Export filename input */}
                  <TextField
                    label="Filename"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
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
              </>
            ) : (
              <>
                {mergeableSets.length === 0 ? (
                  <Center>
                    <Alert severity="success">Import complete</Alert>
                  </Center>
                ) : (
                  <>
                    {mergeableSets.length > 1 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Select a File to Merge or Overwrite
                        </Typography>
                        <Select
                          fullWidth
                          value={selectedFilename || ""}
                          onChange={(e) =>
                            setSelectedFilename(e.target.value as string)
                          }
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
                      </Box>
                    )}

                    {selectedSet?.buckets.map((bucket, idx) => {
                      return (
                        <React.Fragment key={bucket.uuid}>
                          {
                            // Show `Divider` if not the first element
                            idx > 0 && <Divider sx={{ margin: 1 }} />
                          }
                          <TickerBucketMergeDiff
                            incomingBucket={bucket}
                            onMerge={() =>
                              onImportFilename(selectedSet.filename)
                            }
                          />
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </FormControl>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">
          Close
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
