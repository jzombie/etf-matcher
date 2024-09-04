import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Alert, AlertColor, Snackbar } from "@mui/material";

import useStoreStateReader from "@hooks/useStoreStateReader";

export type NotificationContextType = {
  showNotification: (message: string, severity?: AlertColor) => void;
};

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export type NotificationProviderProps = {
  children: ReactNode;
};

type Notification = {
  id: number;
  message: string;
  severity: AlertColor;
};

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]); // Queue for notifications

  // Add a new notification to the queue
  const showNotification = useCallback(
    (message: string, severity: AlertColor = "info") => {
      const id = new Date().getTime(); // Generate a unique ID for each notification

      setNotifications((prevQueue) => {
        const updatedQueue = [...prevQueue, { id, message, severity }];
        return updatedQueue;
      });
    },
    [],
  );

  // Render UI errors as notifications
  const { uiErrors } = useStoreStateReader("uiErrors");
  useEffect(() => {
    if (uiErrors.length) {
      // Errors are prepended, so show the first
      showNotification(uiErrors[0].message, "error");
    }
  }, [uiErrors, showNotification]);

  const handleClose = useCallback(
    (event: React.SyntheticEvent | Event, reason?: string, id?: number) => {
      // Prevent closing on 'clickaway'
      if (reason === "clickaway") {
        return;
      }

      if (id) {
        // Remove the notification by filtering it out
        setNotifications((prevQueue) => prevQueue.filter((n) => n.id !== id));
      }
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={(event, reason) =>
            handleClose(event, reason, notification.id)
          } // Pass the notification ID
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          sx={{
            position: "fixed", // Make sure Snackbar stays fixed on the screen
            bottom: `${index * 80 + 20}px !important`, // Dynamically adjust the bottom position
            left: "24px", // Set position to the left with padding
          }}
        >
          <Alert
            onClose={() =>
              handleClose(new Event("close"), undefined, notification.id)
            } // Manually trigger close
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}
