import React, { useCallback } from "react";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, ButtonProps } from "@mui/material";

import useClipboard from "@hooks/useClipboard";

import customLogger from "@utils/customLogger";

export type TickerSymbolsCopyButtonProps = Omit<
  ButtonProps,
  "children" | "onClick"
> & {
  tickerSymbols: string[];
};

export default function TickerSymbolsCopyButton({
  tickerSymbols,
  variant = "contained",
  size = "small",
  startIcon = <ContentCopyIcon />,
  ...rest
}: TickerSymbolsCopyButtonProps) {
  const { isClipboardAvailable, copyTickerSymbols } = useClipboard();

  const handleCopyTickerSymbols = useCallback(
    // Note: Error handling is handled directly by `copyTickerSymbols`
    () => copyTickerSymbols(tickerSymbols),
    [tickerSymbols, copyTickerSymbols],
  );

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={startIcon}
      onClick={handleCopyTickerSymbols}
      disabled={!isClipboardAvailable}
      {...rest}
    >
      Copy Symbol{tickerSymbols.length !== 1 ? "s" : ""}
    </Button>
  );
}
