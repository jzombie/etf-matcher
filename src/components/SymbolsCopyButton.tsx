import React, { useCallback } from "react";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, ButtonProps } from "@mui/material";

import useClipboard from "@hooks/useClipboard";

export type SymbolsCopyButtonProps = Omit<
  ButtonProps,
  "children" | "onClick"
> & {
  tickerSymbols: string[];
};

export default function SymbolsCopyButton({
  tickerSymbols,
  variant = "contained",
  size = "small",
  startIcon = <ContentCopyIcon />,
  ...rest
}: SymbolsCopyButtonProps) {
  const { isClipboardAvailable, copySymbols } = useClipboard();

  const handleCopySymbols = useCallback(
    () => copySymbols(tickerSymbols),
    [tickerSymbols, copySymbols],
  );

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={startIcon}
      onClick={handleCopySymbols}
      disabled={!isClipboardAvailable}
      {...rest}
    >
      Copy Symbol{tickerSymbols.length !== 1 ? "s" : ""}
    </Button>
  );
}
