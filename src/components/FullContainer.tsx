import React from "react";

import { Container, ContainerProps } from "@mui/material";

import Full from "@layoutKit/Full";

export type FullContainerProps = Omit<ContainerProps, "container">;

/**
 * The `FullContainer` component combines `Full` from `@layoutKit` with MUI's
 * `Container` component to ensure proper rendering of `@layoutKit` components.
 */
export default function FullContainer({
  maxWidth = "lg",
  ...rest
}: FullContainerProps) {
  return <Container component={Full} maxWidth={maxWidth} {...rest} />;
}
