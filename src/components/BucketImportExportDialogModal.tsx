import React, { useCallback, useId, useState } from "react";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
} from "@mui/material";

import store from "@src/store";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import { tickerBucketsToCSV } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

export type BucketImportExportDialogModalProps = Omit<
  DialogModalProps,
  "children"
>;

export default function BucketImportExportDialogModal({
  onClose,
  ...rest
}: BucketImportExportDialogModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleExport = useCallback(() => {
    // TODO: Enable manual selection
    const tickerBuckets = store.state.tickerBuckets;

    // TODO: Refactor accordingly
    tickerBucketsToCSV(tickerBuckets).then((resp: string) => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      customLogger.debug("Selected file:", file.name);
    }
  };

  const handleFileUpload = useCallback(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        customLogger.debug("File content:", content);
        // Process the file content here...
      };
      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);

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
          <Button onClick={handleExport}>Proto::export()</Button>
        </DialogContentText>

        {/* File input for selecting a file */}
        <Input
          type="file"
          inputProps={{ accept: ".csv" }} // Accept only .csv files
          onChange={handleFileSelect}
          fullWidth
        />

        {/* Show the selected file name */}
        {selectedFile && <p>Selected File: {selectedFile.name}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">
          Close
        </Button>
        {/* Button to trigger file upload processing */}
        <Button
          onClick={handleFileUpload}
          variant="contained"
          color="primary"
          disabled={!selectedFile}
        >
          Upload File
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
