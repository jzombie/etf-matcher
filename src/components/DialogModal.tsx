import React, { useEffect, useRef } from "react";

import { Dialog } from "@mui/material";

import { useLocation } from "react-router-dom";

import customLogger from "@utils/customLogger";

export type DialogModalProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function DialogModal({
  open: isOpen,
  onClose,
  children,
}: DialogModalProps) {
  const location = useLocation();
  const initialLocationRef = useRef(location);

  useEffect(() => {
    if (location !== initialLocationRef.current && isOpen) {
      customLogger.debug("Closing modal due to location change", location);
      onClose();

      // Reset `initial` location so the modal can be re-opened from the new location
      initialLocationRef.current = location;
    }
  }, [isOpen, location, onClose]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: "100vw", // Full width for extra small screens
            sm: "50vw", // 50% width for small screens and up
          },
          maxWidth: {
            xs: "100vw", // Full width for extra small screens
            sm: "500px", // Max width of 500px for small screens and up
          },
          minWidth: 320,
          height: {
            xs: "100vh", // Full height for extra small screens
            sm: "60vh", // 60% height for small screens and up
          },
          minHeight: 300,
          maxHeight: "80vh",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          "@media (max-width: 728px), (max-height: 728px)": {
            width: "100vw",
            height: "100dvh", // Assuming the browser supports `dvh`
            maxWidth: "100vw",
            maxHeight: "100dvh", // Assuming the browser supports `dvh`
            border: "none",
            borderRadius: 0,
          },
        },
      }}
    >
      {children}
    </Dialog>
  );
}