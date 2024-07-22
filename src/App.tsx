import React from "react";
import "animate.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { RouterProvider } from "react-router-dom";
import router from "./router";
import { SymbolContainerProvider } from "@components/SymbolContainer";

import useGAPageTracking from "@hooks/useGAPageTracking";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SymbolContainerProvider>
        <RouterProvider router={router} />
      </SymbolContainerProvider>
    </ThemeProvider>
  );
}
