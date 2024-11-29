import React, { useMemo } from "react";

import { TextField, TextFieldProps } from "@mui/material";

import Full from "@layoutKit/Full";

import deepMerge from "@utils/deepMerge";

export type FullTextFieldProps = TextFieldProps;

export default function FullTextField({
  multiline = true,
  variant = "outlined",
  sx = {},
  slotProps = {},
  ...rest
}: FullTextFieldProps) {
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
            backgroundColor: "rgba(0,0,0,.1)",
            border: "1px rgba(255,255,255,.2) solid",
          },
          // "& .MuiInputBase-input": {
          //   backgroundColor: "transparent",
          // },
        },
        { ...(sx || {}) },
      ),
    [sx],
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
