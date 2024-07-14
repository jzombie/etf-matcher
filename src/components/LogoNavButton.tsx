import React from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";

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
};

export default function LogoNavButton({ to = "/" }: LogoNavButtonProps) {
  return <StyledNavButton to={to}>ETF Matcher</StyledNavButton>;
}
