import React, { useState } from "react";
import { Dialog, DialogProps } from "@mui/material";
import { styled } from "@mui/system";

import FullViewport from "@layoutKit/FullViewport";

const TransparentModalStyled = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    // width: "100vw",
    // height: "100vh",
    // maxWidth: "100vw",
    // maxHeight: "100vh",
    // borderRadius: 0,
    backgroundColor: "transparent",
    backgroundImage: "none",
    // boxShadow: "none",
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "transparent",
  },
}));

// TODO: Add open state to props
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
