import React from "react";
import { Button, ConfigProvider, Input, Space, theme } from "antd";
import { Layout } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";

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
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
