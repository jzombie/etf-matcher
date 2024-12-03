import React, { useCallback, useMemo, useState } from "react";

import { Box, Button, Typography } from "@mui/material";

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
  onSubmit: (selectedSearchResults: RustServiceTickerSearchResult[]) => void;
  onCancel?: () => void;
};

export default function TickerSelectorForm({
  searchResults,
  onSubmit,
  onCancel,
}: TickerSelectorFormProps) {
  const [selectedItems, setSelectedItems] = useState<
    RustServiceTickerSearchResult[]
  >(searchResults.results);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent the form from actually submitting anywhere

      onSubmit(selectedItems);
    },
    [onSubmit, selectedItems],
  );

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
            Choose your ticker{searchResults.results.length !== 1 ? "s" : ""}
          </Typography>
        </Header>
        <Content>
          <Scrollable>
            <SelectableGrid
              aria-label="Ticker selection grid"
              items={gridItems}
              centerItems
              renderItem={(searchResult) => {
                const isSelected = selectedTickerIds.includes(
                  searchResult.ticker_id,
                );

                return (
                  <Box sx={{ textAlign: "center" }}>
                    <EncodedImage
                      encSrc={searchResult.logo_filename}
                      style={{ width: 50, height: 50 }}
                    />
                    <Box sx={{ textAlign: "center", marginBottom: 4 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {searchResult.company_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {searchResult.symbol}
                        {" | "}
                        {searchResult.exchange_short_name}
                      </Typography>
                    </Box>
                    {isSelected ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "green",
                            color: "white",
                            display: "inline-flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          ✓
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "gray",
                          }}
                        ></Box>
                      </Box>
                    )}
                  </Box>
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
              disabled={!selectedItems.length}
            >
              Submit
            </Button>
          </Padding>
        </Footer>
      </Layout>
    </Full>
  );
}
