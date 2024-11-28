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

  const handleCopyTickerSymbols = useCallback(() => {
    try {
      copyTickerSymbols(tickerSymbols);
    } catch (err) {
      // Note: Error handling is handled in the `copyTickerSymbols` command
      // directly, so UIError triggering is not necessary here
      customLogger.error(err);
    }
  }, [tickerSymbols, copyTickerSymbols]);

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
