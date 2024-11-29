import React, { useCallback, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

import { extractSearchResultsFromText } from "@services/RustService";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

export type TickerSymbolTextFieldProps = {
  onProcess: (text: string) => void;
};

export default function TickerSymbolTextField({
  onProcess,
}: TickerSymbolTextFieldProps) {
  const onProcessStableRef = useStableCurrentRef(onProcess);

  const [text, setText] = useState("");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setText(event.target.value);

      // TODO: Remove
      extractSearchResultsFromText(event.target.value).then((searchResults) =>
        customLogger.debug("TODO: Handle", { searchResults }),
      );
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const onProcess = onProcessStableRef.current;

    if (typeof onProcess === "function") {
      onProcess(text);
    }
  }, [onProcessStableRef, text]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 500,
        margin: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h6" align="center">
        Paste Text to Extract Stock Symbols
      </Typography>
      <TextField
        multiline
        rows={6}
        variant="outlined"
        placeholder="Paste your text here..."
        value={text}
        onChange={handleChange}
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!text.trim()}
      >
        Submit
      </Button>
    </Box>
  );
}
