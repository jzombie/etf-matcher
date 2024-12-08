import React, { useCallback, useState } from "react";

import { Button, Typography } from "@mui/material";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";

import FullTextField from "@components/FullTextField";
import Padding from "@components/Padding";

export type TickerSymbolTextFormProps = {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
};

export default function TickerSymbolTextForm({
  onSubmit,
  onCancel,
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
          <Typography variant="body2" align="center">
            Note: This aims to extract stock symbols from both company names and
            symbols, but the extraction of company names is still in the early
            beta stage.
          </Typography>
        </Header>
        <Content>
          <FullTextField
            placeholder="Paste your text here..."
            value={text}
            onChange={handleChange}
          />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          <Padding half>
            <Button type="button" color="error" onClick={onCancel}>
              Cancel
            </Button>

            <Button
              type="submit" // Changes to submit type for form behavior
              variant="contained"
              color="primary"
              disabled={!text.trim()}
            >
              Submit
            </Button>
          </Padding>
        </Footer>
      </Layout>
    </Full>
  );
}
