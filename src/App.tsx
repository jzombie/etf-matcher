import React from "react";
// import { ConfigProvider, theme } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { SymbolContainerProvider } from "@components/SymbolContainer";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export default function App() {
  return (
    // <ConfigProvider
    //   // https://ant.design/theme-editor
    //   theme={{
    //     algorithm: theme.darkAlgorithm,
    //     components: {
    //       Layout: {
    //         headerBg: "rgb(113, 44, 44)",
    //       },
    //       Menu: {
    //         itemBg: "transparent",
    //         darkItemBg: "transparent",
    //       },
    //       Drawer: {
    //         colorBgElevated: "rgba(0,0,0,.9)",
    //         // backdropFilter: "blur(5px)",
    //       },
    //     },
    //   }}
    // >
    <SymbolContainerProvider>
      <RouterProvider router={router} />
    </SymbolContainerProvider>
    // </ConfigProvider>
  );
}
