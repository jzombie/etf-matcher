import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

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
  useTheme,
} from "@mui/material";

import Center from "@layoutKit/Center";
import { FILE_IMPORT_ACCEPT_MAP } from "@src/constants";
import type { TickerBucketSet } from "@src/providers/TickerBucketImportExportProvider";
import store from "@src/store";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import useBucketImportExportContext from "@hooks/useBucketImportExportContext";

import customLogger from "@utils/customLogger";

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

  // TODO: Rename `selectedFiles`; it's confusing with `selectedFilename` as well
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
    reset();

    // Auto-select filename if only one imported file
    if (mergeableSets?.length === 1) {
      setSelectedFilename(mergeableSets[0].filename);
    }
  }, [mergeableSets, reset]);

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
      if (files) {
        setSelectedFiles(files);
        importFiles(files);
      } else {
        customLogger.warn("No files selected");
      }
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

  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogModal
      {...rest}
      open={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>Import/Export</DialogTitle>

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
              <FileUploadArea
                onSetExportFilename={setExportFilename}
                exportFilename={exportFilename}
                onExport={handleExport}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
              />
            ) : (
              <>
                {mergeableSets.length === 0 ? (
                  <Center>
                    <Alert severity="success">Import complete</Alert>
                  </Center>
                ) : (
                  <>
                    {mergeableSets.length > 1 && (
                      <MergeableSetsSelector
                        selectedFilename={selectedFilename}
                        onSetSelectedFilename={setSelectedFilename}
                        mergeableSets={mergeableSets}
                      />
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

type FileUploadAreaProps = {
  onSetExportFilename: (filename: string) => void;
  exportFilename: string;
  onExport: () => void;
  selectedFiles: FileList | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileUploadArea = ({
  onSetExportFilename,
  exportFilename,
  onExport,
  selectedFiles,
  onFileSelect,
}: FileUploadAreaProps) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatted for `input[type="file"]` element
  const extensionTypes = useMemo(
    () => FILE_IMPORT_ACCEPT_MAP.get("csv")?.mimeTypes?.join(", ") || "",
    [],
  );

  return (
    <>
      <Box mt={1}>
        {/* Export filename input */}
        <TextField
          label="Filename"
          value={exportFilename}
          onChange={(e) => onSetExportFilename(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Export Button */}
        <Button
          onClick={onExport}
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
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(2),
            textAlign: "center",
            cursor: "pointer",
            mb: 2,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Typography variant="body2">
            {selectedFiles
              ? `${selectedFiles.length} file(s) selected`
              : "Drag and drop files here or click to select"}
          </Typography>
        </Box>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={extensionTypes}
          multiple
          onChange={onFileSelect}
          style={{ display: "none" }}
        />
      </Box>
    </>
  );
};

type MergeableSetsSelectorProps = {
  selectedFilename: string | null;
  onSetSelectedFilename: (filename: string) => void;
  mergeableSets: TickerBucketSet[];
};

const MergeableSetsSelector = ({
  selectedFilename,
  onSetSelectedFilename,
  mergeableSets,
}: MergeableSetsSelectorProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a File to Merge or Overwrite
      </Typography>
      <Select
        fullWidth
        value={selectedFilename || ""}
        onChange={(e) => onSetSelectedFilename(e.target.value as string)}
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
  );
};