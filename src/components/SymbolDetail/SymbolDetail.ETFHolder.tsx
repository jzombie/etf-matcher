import React from "react";
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

export type ETFHolderProps = {
  etfSymbol: string;
};

export default function ETFHolderProps({ etfSymbol }: ETFHolderProps) {
  const navigate = useNavigate();

  // TODO: Look up more information about this symbol (i.e. holdings, etc.)

  return (
    <Button onClick={() => navigate(`/search?query=${etfSymbol}&exact=true`)}>
      {etfSymbol}
    </Button>
  );
}
