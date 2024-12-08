import React, { useMemo } from "react";

import { TextField, TextFieldProps } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import Full from "@layoutKit/Full";

import deepMerge from "@utils/deepMerge";

export type FullTextFieldProps = TextFieldProps & {
  backgroundOpacity?: number;
};

export default function FullTextField({
  multiline = true,
  variant = "outlined",
  sx = {},
  slotProps = {},
  backgroundOpacity = 0.4,
  ...rest
}: FullTextFieldProps) {
  const theme = useTheme();

  const deepMergedSlotProps = useMemo(
    () =>
      deepMerge(
        {
          input: {
            sx: {
              height: "100%", // Ensures it takes full height of the parent
              alignItems: "flex-start", // Aligns the text to the top
              overflow: "auto",
              // Remove the border, as it doesn't scroll with the component
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // Removes the border
              },
            },
          },
        },
        slotProps,
      ),
    [slotProps],
  );

  const deepMergedSx = useMemo(
    () =>
      deepMerge(
        {
          border: 0,
          "& .MuiOutlinedInput-root": {
            backgroundColor: alpha(
              theme.palette.background.default,
              backgroundOpacity,
            ),
            border: `1px solid ${theme.palette.divider}`,
          },
          // "& .MuiInputBase-input": {
          //   backgroundColor: "transparent",
          // },
        },
        { ...(sx || {}) },
      ),
    [sx, theme, backgroundOpacity],
  );

  return (
    <Full
      component={TextField}
      multiline={multiline}
      variant={variant}
      slotProps={deepMergedSlotProps}
      sx={deepMergedSx}
      {...rest}
    />
  );
}
