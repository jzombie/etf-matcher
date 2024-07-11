import React from "react";
import { ConfigProvider, theme } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { SymbolContainerProvider } from "@components/SymbolContainer";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // colorPrimary: "#1890ff", // Primary color
          // colorBgBase: "#001529", // Base background color
          // colorText: "#ffffff", // Text color for readability on dark backgrounds
          // colorTextSecondary: "#8c8c8c", // Secondary text color
          fontFamily: "'Roboto', sans-serif", // Custom font
          // fontSize: 16, // Base font size
          borderRadius: 16, // Border radius for a softer look
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
      <SymbolContainerProvider>
        <RouterProvider router={router} />
      </SymbolContainerProvider>
    </ConfigProvider>
  );
}
