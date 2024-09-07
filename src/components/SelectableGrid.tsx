import React, { useCallback, useEffect, useState } from "react";

import { Grid, Paper } from "@mui/material";

// Define the type for the generic item
export type SelectableGridItem<T> = {
  data: T;
  id: string | number;
};

// Define the props for the generic grid
export type SelectableGridProps<T> = {
  items: SelectableGridItem<T>[]; // Array of items to display
  columns?: number; // Number of columns in the grid
  onItemSelect: (item: T) => void; // Callback when an item is selected
  renderItem: (item: T, isSelected: boolean) => React.ReactNode; // Render function for each item
};

export default function SelectableGrid<T>({
  items,
  columns = 3,
  onItemSelect,
  renderItem,
}: SelectableGridProps<T>) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const handleSelectItem = useCallback(
    (index: number) => {
      if (items[index]) {
        onItemSelect(items[index].data);
      }
    },
    [items, onItemSelect],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex + columns >= items.length
              ? prevIndex === null
                ? 0
                : prevIndex // Stay on the last row if it's not full
              : prevIndex + columns,
          );
          break;
        case "ArrowUp":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex - columns < 0
              ? prevIndex // Stay on the first row
              : prevIndex - columns,
          );
          break;
        case "ArrowRight":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex === items.length - 1
              ? 0 // Loop around to the first item
              : prevIndex + 1,
          );
          break;
        case "ArrowLeft":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex === 0
              ? items.length - 1 // Loop around to the last item
              : prevIndex - 1,
          );
          break;
        case "Enter":
          if (highlightedIndex !== null && items[highlightedIndex]) {
            handleSelectItem(highlightedIndex);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, highlightedIndex, handleSelectItem, columns]);

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,.1)",
              },
              width: "100%",
              height: "100%",
              backgroundColor:
                highlightedIndex === index ? "rgba(255,255,255,.2)" : "inherit",
            }}
            onClick={() => handleSelectItem(index)}
          >
            {renderItem(item.data, highlightedIndex === index)}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
