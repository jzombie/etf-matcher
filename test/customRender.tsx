import React from "react";

import { RenderOptions, render } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";

import AppErrorBoundaryProvider from "../src/providers/AppErrorBoundaryProvider";
import NotificationProvider from "../src/providers/NotificationProvider";

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppErrorBoundaryProvider>
      <BrowserRouter>
        <NotificationProvider>{children}</NotificationProvider>
      </BrowserRouter>
    </AppErrorBoundaryProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from "@testing-library/react";
export { customRender as render };
