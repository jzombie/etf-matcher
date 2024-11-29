import React, { useCallback } from "react";

import { Button, Typography } from "@mui/material";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";

import Padding from "@components/Padding";

export type TickerSelectorFormProps = {
  onSubmit: (tickerIds: number[]) => void;
  onCancel?: () => void;
};

export default function TickerSelectorForm({
  onSubmit,
  onCancel,
}: TickerSelectorFormProps) {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent the form from actually submitting anywhere

      onSubmit([]);
    },
    [onSubmit],
  );

  return (
    <Full component="form" onSubmit={handleSubmit}>
      <Layout>
        <Header>
          <Typography variant="h6" align="center">
            {
              // TODO: Pluralize or singularize based on props
            }
            Choose your tickers
          </Typography>
        </Header>
        <Content>[selector placeholder]</Content>
        <Footer style={{ textAlign: "center" }}>
          <Padding half>
            {typeof onCancel === "function" && (
              <Button type="button" color="error" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit" // Changes to submit type for form behavior
              variant="contained"
              color="primary"
              // TODO: Disable if no tickers are selected
              // disabled={!text.trim()}
            >
              Submit
            </Button>
          </Padding>
        </Footer>
      </Layout>
    </Full>
  );
}
