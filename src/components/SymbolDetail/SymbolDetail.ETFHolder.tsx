import React from "react";
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

export type ETFHolderProps = {
  etfSymbol: string;
};

export default function ETFHolderProps({ etfSymbol }: ETFHolderProps) {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(`/search?query=${etfSymbol}&exact=true`)}>
      {etfSymbol}
    </Button>
  );
}
