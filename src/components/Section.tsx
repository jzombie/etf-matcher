import React, { ReactNode } from "react";

import { Box, BoxProps } from "@mui/material";

import Padding from "@components/Padding";

type SectionProps = BoxProps & {
  children: ReactNode;
  bgColor?: string;
  noPadding?: boolean;
};

export default function Section({
  children,
  bgColor,
  noPadding,
  sx = {},
  ...rest
}: SectionProps) {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: bgColor || "rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        ...sx,
      }}
      {...rest}
    >
      {!noPadding ? <Padding>{children}</Padding> : children}
    </Box>
  );
}
