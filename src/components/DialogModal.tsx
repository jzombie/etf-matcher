import React, { useEffect, useMemo, useRef } from "react";

import { Dialog, DialogProps, SxProps } from "@mui/material";

import { Location, useLocation } from "react-router-dom";

import customLogger from "@utils/customLogger";
import deepMerge from "@utils/deepMerge";

export type DialogModalProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  staticHeight?: boolean;
  fullViewport?: boolean;
};

export default function DialogModal({
  open: isOpen,
  onClose,
  children,
  staticHeight,
  fullViewport,
}: DialogModalProps) {
  // Track the location when the modal is initially opened
  const location = useLocation();
  const modalOpeningLocationRef = useRef<Location>();

  useEffect(() => {
    if (isOpen) {
      if (location !== modalOpeningLocationRef.current) {
        customLogger.debug("Closing modal due to location change", location);
        if (typeof onClose === "function") {
          onClose();
        }
      }
    } else {
      // Store the current location before the modal is opened
      modalOpeningLocationRef.current = location;
    }
  }, [isOpen, location, onClose]);

  const paperProps = useMemo<DialogProps["PaperProps"]>(() => {
    let sxProps: SxProps = {
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    };

    if (fullViewport) {
      sxProps = deepMerge(sxProps, {
        width: "100dvw",
        maxWidth: "100dvw",
        minWidth: "100dvw",
        //
        height: "100dvh",
        maxHeight: "100dvh",
        minHeight: "100dvh",
        //
        border: "none",
        borderRadius: 0,
      }) as Record<string, unknown>;
    } else {
      sxProps = deepMerge(sxProps, {
        width: {
          xs: "100dvw", // Full width for extra small screens
          sm: "50vw", // 50% width for small screens and up
        },
        maxWidth: {
          xs: "100dvw", // Full width for extra small screens
          sm: "500px", // Max width of 500px for small screens and up
        },
        minWidth: 320,
        height: staticHeight
          ? {
              xs: "100dvh", // Full height for extra small screens
              sm: "60dvh", // 60% height for small screens and up
            }
          : undefined,
        minHeight: staticHeight ? 300 : undefined,
        maxHeight: staticHeight ? "80vh" : undefined,
        "@media (max-width: 728px), (max-height: 728px)": {
          width: "100vw",
          height: "100dvh", // Assuming the browser supports `dvh`
          maxWidth: "100vw",
          maxHeight: "100dvh", // Assuming the browser supports `dvh`
          border: "none",
          borderRadius: 0,
        },
      }) as Record<string, unknown>;
    }

    return { sx: sxProps };
  }, [fullViewport, staticHeight]);

  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={paperProps}>
      {children}
    </Dialog>
  );
}
