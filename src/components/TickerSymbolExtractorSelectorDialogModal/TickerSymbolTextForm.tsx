import React, { useCallback, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

export type TickerSymbolTextFormProps = {
  onSubmit: (text: string) => void;
};

export default function TickerSymbolTextForm({
  onSubmit,
}: TickerSymbolTextFormProps) {
  const [text, setText] = useState("");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent the form from actually submitting anywhere

      onSubmit(text);
    },
    [onSubmit, text],
  );

  return (
    <form onSubmit={handleSubmit}>
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
          type="submit" // Changes to submit type for form behavior
          variant="contained"
          color="primary"
          disabled={!text.trim()}
        >
          Submit
        </Button>
      </Box>
    </form>
  );
}
