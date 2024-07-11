import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { RouterProvider } from "react-router-dom";
import router from "./router";
import { SymbolContainerProvider } from "@components/SymbolContainer";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SymbolContainerProvider>
        <RouterProvider router={router} />
      </SymbolContainerProvider>
    </ThemeProvider>
  );
}
