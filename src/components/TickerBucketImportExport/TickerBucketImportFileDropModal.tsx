import React from "react";

import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";

import Center from "@layoutKit/Center";
import Full from "@layoutKit/Full";

import Section from "@components/Section";

import TransparentModal, { TransparentModalProps } from "../TransparentModal";

export type TickerBucketImportFileDropModalProps = Omit<
  TransparentModalProps,
  "children"
>;

const BORDER_INSET: number = 16;

export default function TickerBucketImportFileDropModal({
  ...rest
}: TickerBucketImportFileDropModalProps) {
  const theme = useTheme();

  return (
    <TransparentModal {...rest}>
      <Full style={{ padding: BORDER_INSET }}>
        <Full
          style={{
            border: `8px dashed ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            textAlign: "center",
          }}
        >
          <Center>
            <Section>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <CloudUploadIcon style={{ fontSize: 60, color: "#666" }} />

                <Typography
                  variant="h6"
                  color="textSecondary"
                  style={{ marginTop: 8 }}
                >
                  Drop CSV to Import Buckets
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  This file should contain portfolios, watchlists, or both
                </Typography>
              </Box>
            </Section>
          </Center>
        </Full>
      </Full>
    </TransparentModal>
  );
}
