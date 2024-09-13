import React from "react";

import { Container, ContainerProps } from "@mui/material";

import Full from "@layoutKit/Full";

export type FullContainerProps = Omit<ContainerProps, "container">;

export default function FullContainer({
  maxWidth = "lg",
  ...rest
}: FullContainerProps) {
  return <Container component={Full} maxWidth={maxWidth} {...rest} />;
}
