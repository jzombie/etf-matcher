import React, { useCallback, useState } from "react";

import { Button, TextField, Typography } from "@mui/material";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";

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
    <Full component="form" onSubmit={handleSubmit}>
      <Layout>
        <Header>
          <Typography variant="h6" align="center">
            Paste Text to Extract Stock Symbols
          </Typography>
        </Header>
        <Content>
          <Full
            component={TextField}
            multiline
            variant="outlined"
            placeholder="Paste your text here..."
            value={text}
            onChange={handleChange}
            slotProps={{
              input: {
                sx: {
                  height: "100%", // Ensures it takes full height of the parent
                  alignItems: "flex-start", // Aligns the text to the top
                  overflow: "auto",
                  // Remove the border, as it doesn't scroll with the component
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Removes the border
                  },
                },
              },
            }}
            sx={{
              border: 0,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(0,0,0,.1)",
                border: "1px rgba(255,255,255,.2) solid",
              },
              // "& .MuiInputBase-input": {
              //   backgroundColor: "transparent",
              // },
            }}
          />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          <Button
            type="submit" // Changes to submit type for form behavior
            variant="contained"
            color="primary"
            disabled={!text.trim()}
          >
            Submit
          </Button>
        </Footer>
      </Layout>
    </Full>
  );
}
