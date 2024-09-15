import React from "react";

import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Full from "@layoutKit/Full";

import TransparentModal, { TransparentModalProps } from "./TransparentModal";

export type BucketImportFileDropModalProps = Omit<
  TransparentModalProps,
  "children"
>;

const BORDER_INSET: number = 16;

export default function BucketImportFileDropModal({
  ...rest
}: BucketImportFileDropModalProps) {
  return (
    <TransparentModal {...rest}>
      <Full style={{ padding: BORDER_INSET }}>
        <Full
          style={{
            border: "8px dashed #cccccc",
            textAlign: "center",
          }}
        >
          <Center>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <CloudUploadIcon style={{ fontSize: 60, color: "#666" }} />

              {/* Typography for 'Drag & Drop Files Here' text */}
              <Typography
                variant="h6"
                color="textSecondary"
                style={{ marginTop: 8 }}
              >
                Drag & Drop Files Here
              </Typography>

              {/* Secondary text */}
              <Typography variant="body2" color="textSecondary">
                or click to browse files
              </Typography>
            </Box>
          </Center>
        </Full>
      </Full>
    </TransparentModal>
  );
}
