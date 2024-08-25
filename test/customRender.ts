import React from "react";

import { RenderOptions, render } from "@testing-library/react";

import NotificationProvider from "../src/components/NotificationProvider";

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: NotificationProvider, ...options });
};

export * from "@testing-library/react";
export { customRender as render };
