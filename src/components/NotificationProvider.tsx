import React, { ReactNode, createContext, useCallback, useState } from "react";

import { Alert, AlertColor, Snackbar } from "@mui/material";

// Define the context type
export type NotificationContextType = {
  showNotification: (message: string, severity?: AlertColor) => void;
};

// Create the context
export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export type NotificationProviderProps = {
  children: ReactNode;
};

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");

  const showNotification = useCallback(
    (message: string, severity: AlertColor = "info") => {
      setMessage(message);
      setSeverity(severity);
      setOpen(true);
    },
    [],
  );

  const handleClose = useCallback(
    (_: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return;
      }
      setOpen(false);
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
