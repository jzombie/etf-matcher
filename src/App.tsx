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

import router from "./router";
import { darkTheme } from "./theme";

export default function App() {
  useGAPageTracking();

  return (
    <AppErrorBoundaryProvider>
      <MultiMQTTRoomProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <NotificationProvider>
            <TickerContainerProvider>
              <RouterProvider router={router} />
            </TickerContainerProvider>
          </NotificationProvider>
        </ThemeProvider>
      </MultiMQTTRoomProvider>
    </AppErrorBoundaryProvider>
  );
}
