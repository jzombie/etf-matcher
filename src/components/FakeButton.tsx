import React from "react";

import { Box, BoxProps, useTheme } from "@mui/material";

export type FakeButtonProps = BoxProps;

export default function FakeButton({ children, ...props }: FakeButtonProps) {
  const theme = useTheme();

  return (
    <Box
      {...props}
      sx={{
        padding: "6px 16px",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText, // Retains the same foreground color
        borderRadius: "4px",
        cursor: "pointer",
        textAlign: "center",
        display: "inline-block",
        verticalAlign: "middle",
        fontWeight: "bold",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
        ...props.sx, // Apply additional sx if passed
      }}
    >
      {children}
    </Box>
  );
}
