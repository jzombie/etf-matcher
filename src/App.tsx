import React from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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
  typography: {
    fontSize: 12, // Reduce the base font size (default is 14)
    button: {
      fontSize: "0.875rem", // Smaller button text
    },
  },
  spacing: 4, // Reduce the spacing scale (default is 8)
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
          padding: "4px 8px", // Smaller padding
          fontSize: "0.875rem", // Smaller text size for buttons
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem", // Smaller input text
          padding: "4px 8px", // Smaller padding
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: "8px", // Reduce padding inside dialogs
          fontSize: "0.875rem", // Smaller text size inside dialogs,
          backgroundColor: "rgba(0,0,0,.8)",
          backdropFilter: "blur(10px)",
          color: "#ffffff",
          borderRadius: 10,
          border: "2px rgba(38,100,100,.8) solid",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#1976d2",
            },
            "&:hover fieldset": {
              borderColor: "#64b5f6",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1565c0",
            },
          },
          "& .MuiSelect-icon": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          fontWeight: 500,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          fontWeight: 400,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
        },
      },
    },
  },
});

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
