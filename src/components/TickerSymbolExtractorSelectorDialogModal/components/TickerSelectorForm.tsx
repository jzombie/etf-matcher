import React, { useCallback, useMemo, useState } from "react";

import { Button, Typography } from "@mui/material";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import type {
  RustServicePaginatedResults,
  RustServiceTickerSearchResult,
} from "@services/RustService";

import EncodedImage from "@components/EncodedImage";
import Padding from "@components/Padding";
import SelectableGrid, { SelectableGridItem } from "@components/SelectableGrid";

export type TickerSelectorFormProps = {
  searchResults: RustServicePaginatedResults<RustServiceTickerSearchResult>;
  onSubmit: (tickerIds: number[]) => void;
  onCancel?: () => void;
};

export default function TickerSelectorForm({
  searchResults,
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

  const [selectedItems, setSelectedItems] = useState<
    RustServiceTickerSearchResult[]
  >([]);

  const handleToggleItem = useCallback(
    (searchResultItem: RustServiceTickerSearchResult) => {
      setSelectedItems((prev) => {
        const exists = prev.some(
          (item) => item.ticker_id === searchResultItem.ticker_id,
        );
        if (exists) {
          // Remove the item if it already exists
          return prev.filter(
            (item) => item.ticker_id !== searchResultItem.ticker_id,
          );
        } else {
          // Add the item if it doesn't exist
          return [...prev, searchResultItem];
        }
      });
    },
    [],
  );

  const gridItems = useMemo<
    SelectableGridItem<RustServiceTickerSearchResult>[]
  >(
    () =>
      searchResults.results.map((result) => ({
        id: result.ticker_id,
        data: result,
      })),
    [searchResults],
  );

  const selectedTickerIds = useMemo(
    () => selectedItems.map((item) => item.ticker_id),
    [selectedItems],
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
        <Content>
          <Scrollable>
            <SelectableGrid
              items={gridItems}
              renderItem={(searchResult) => {
                const isSelected = selectedTickerIds.includes(
                  searchResult.ticker_id,
                );

                return (
                  <div style={{ textAlign: "center" }}>
                    <EncodedImage
                      encSrc={searchResult.logo_filename}
                      style={{ width: 50, height: 50, marginBottom: 8 }}
                    />
                    [{isSelected ? "checked" : "not checked"} ]
                  </div>
                );
              }}
              onItemSelect={handleToggleItem}
            />
          </Scrollable>
        </Content>
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