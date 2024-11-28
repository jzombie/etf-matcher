import React, { useEffect } from "react";

import { Box, BoxProps } from "@mui/material";

import { generateQRCode } from "@services/RustService";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePromise from "@hooks/usePromise";

import customLogger from "@utils/customLogger";

export type QRCodeProps = Omit<BoxProps, "children"> & {
  data: string;
};

export default function QRCode({ data, ...rest }: QRCodeProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const { data: qrCodeHTML, execute: executeQRCodeGeneration } = usePromise<
    string,
    [QRCodeProps["data"]]
  >({
    fn: (data) => generateQRCode(data),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not generate QR code"));
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    executeQRCodeGeneration(data);
  }, [data, executeQRCodeGeneration]);

  return (
    <Box
      component="div"
      {...rest}
      dangerouslySetInnerHTML={{ __html: qrCodeHTML || "" }}
    />
  );
}
