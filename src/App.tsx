import React from "react";
import { ConfigProvider, theme } from "antd";
// import { Layout } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { SymbolContainerProvider } from "@components/SymbolContainer";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm: theme.darkAlgorithm,

        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      <SymbolContainerProvider>
        <RouterProvider router={router} />
      </SymbolContainerProvider>
    </ConfigProvider>
  );
}
