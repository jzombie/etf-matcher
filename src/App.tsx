import React from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "animate.css";
import { RouterProvider } from "react-router-dom";

import { TickerContainerProvider } from "@components/TickerContainer";

import useGAPageTracking from "@hooks/useGAPageTracking";

import { MQTTRoomProvider } from "@utils/MQTTRoom/react/MQTTRoomProvider";

import router from "./router";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff9800",
    },
    background: {
      default: "#121212",
      paper: "#1d1d1d",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
    action: {
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(255, 255, 255, 0.16)",
      disabled: "rgba(255, 255, 255, 0.3)",
      focus: "rgba(255, 255, 255, 0.12)",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1d1d1d",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&$selected": {
            backgroundColor: "rgba(255, 255, 255, 0.16)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.16)",
            },
          },
        },
      },
    },
  },
});

export default function App() {
  useGAPageTracking();

  return (
    <MQTTRoomProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <TickerContainerProvider>
          <RouterProvider router={router} />
        </TickerContainerProvider>
      </ThemeProvider>
    </MQTTRoomProvider>
  );
}
