import React, { ReactNode } from "react";

import { Box, BoxProps } from "@mui/material";

import Padding from "@layoutKit/Padding";

type SectionProps = BoxProps & {
  children: ReactNode;
  bgColor?: string;
  noPadding?: boolean;
};

export default function Section({
  children,
  bgColor,
  noPadding,
  ...rest
}: SectionProps) {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: bgColor || "rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
      {...rest}
    >
      {!noPadding ? <Padding>{children}</Padding> : children}
    </Box>
  );
}
