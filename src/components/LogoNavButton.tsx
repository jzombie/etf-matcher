/// <reference types="vite-plugin-svgr/client" />
import React from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";

import Logo from "@assets/etf-matcher.logo.white.svg?react";

const StyledNavButton = styled(Link)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "white",
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 700,
  fontSize: "1.5rem",
  padding: theme.spacing(1),
  "&:hover": {
    textDecoration: "none",
    color: "white",
  },
}));

export type LogoNavButtonProps = {
  to?: string;
  onClick?: (evt: React.SyntheticEvent) => void;
};

export default function LogoNavButton({
  to = "/",
  onClick,
}: LogoNavButtonProps) {
  return (
    <StyledNavButton to={to} title={"ETF Matcher"} onClick={onClick}>
      <Logo width={100} height={50} />
    </StyledNavButton>
  );
}
