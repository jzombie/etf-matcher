import React from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "animate.css";
import { RouterProvider } from "react-router-dom";

import NotificationProvider from "@components/NotificationProvider";
import { TickerContainerProvider } from "@components/TickerContainer";

import useGAPageTracking from "@hooks/useGAPageTracking";

import MultiMQTTRoomProvider from "@utils/MQTTRoom/react/MultiMQTTRoomProvider";

import router from "./router";
import { darkTheme } from "./theme";

export default function App() {
  useGAPageTracking();

  return (
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
  );
}
