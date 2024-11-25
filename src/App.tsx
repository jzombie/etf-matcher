import React from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import AppErrorBoundaryProvider from "@providers/AppErrorBoundaryProvider";
import MultiMQTTRoomProvider from "@providers/MultiMQTTRoomProvider";
import NotificationProvider from "@providers/NotificationProvider";
import TickerContainerProvider from "@providers/TickerContainerProvider";
import "animate.css";
import { RouterProvider } from "react-router-dom";

import useGAPageTracking from "@hooks/useGAPageTracking";
import useStoreStateReader from "@hooks/useStoreStateReader";

import router from "./router";
import useAppTheme from "./theme";

export default function App() {
  useGAPageTracking();

  const { appThemeProps } = useStoreStateReader("appThemeProps");

  const appTheme = useAppTheme({ fontMode: appThemeProps.fontMode });

  return (
    <AppErrorBoundaryProvider>
      <MultiMQTTRoomProvider>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <NotificationProvider>
            <TickerContainerProvider>
              {
                // Note: Additional providers are located in `router.ts`
              }
              <RouterProvider router={router} />
            </TickerContainerProvider>
          </NotificationProvider>
        </ThemeProvider>
      </MultiMQTTRoomProvider>
    </AppErrorBoundaryProvider>
  );
}
