import React from "react";

import { Dialog, DialogProps } from "@mui/material";
import { styled } from "@mui/system";

import FullViewport from "@layoutKit/FullViewport";

const TransparentModalStyled = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    unset: "all",
    width: "100vw",
    height: "100vh",
    minWidth: "100vw",
    minHeight: "100vh",
    // maxWidth: "100vw",
    // maxHeight: "100vh",
    // borderRadius: 0,
    backgroundColor: "transparent",
    backgroundImage: "none",
    // boxShadow: "none"
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "transparent",
  },
}));

export type TransparentModalProps = DialogProps;

export default function TransparentModal({
  children,
  ...rest
}: TransparentModalProps) {
  return (
    <TransparentModalStyled {...rest}>
      <FullViewport>{children}</FullViewport>
    </TransparentModalStyled>
  );
}
