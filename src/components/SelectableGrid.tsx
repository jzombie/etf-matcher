import React, { useCallback, useEffect, useRef, useState } from "react";

import { Grid, Paper } from "@mui/material";

// Define the type for the generic item
export type SelectableGridItem<T> = {
  data: T;
  id: string | number;
};

// Define the props for the generic grid
export type SelectableGridProps<T> = {
  items: SelectableGridItem<T>[]; // Array of items to display
  maxColumns?: number; // Number of columns in the grid (optional, fallback if container resizing isn't used)
  minItemWidth?: number; // Minimum width of each item in the grid
  onItemSelect: (item: T) => void; // Callback when an item is selected
  renderItem: (item: T, isSelected: boolean) => React.ReactNode; // Render function for each item
};

export default function SelectableGrid<T>({
  items,
  maxColumns = 3, // Fallback to the passed columns value
  minItemWidth = 250, // Fallback to 250px per item if not provided
  onItemSelect,
  renderItem,
}: SelectableGridProps<T>) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [dynamicColumns, setDynamicColumns] = useState(maxColumns); // This will dynamically adjust based on container size
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectItem = useCallback(
    (index: number) => {
      if (items[index]) {
        onItemSelect(items[index].data);
      }
    },
    [items, onItemSelect],
  );

  // Dynamically calculate the number of columns based on container size
  const calculateColumns = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const calculatedColumns = Math.max(
        1,
        Math.floor(containerWidth / minItemWidth),
      );

      // Prevent going above `maxColumns`; if `calculatedColumns` is greater
      // than `maxColumns`, use `maxColumns`.
      setDynamicColumns(Math.min(maxColumns, calculatedColumns));
    }
  }, [maxColumns, minItemWidth]);

  // TODO: Refactor into `useResizeObserver` hook
  useEffect(() => {
    calculateColumns(); // Initial calculation

    const resizeObserver = new ResizeObserver(() => {
      calculateColumns(); // Recalculate columns when the container is resized
    });

    const container = containerRef.current;

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [calculateColumns]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex + dynamicColumns >= items.length
              ? prevIndex === null
                ? 0
                : prevIndex // Stay on the last row if it's not full
              : prevIndex + dynamicColumns,
          );
          break;
        case "ArrowUp":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex - dynamicColumns < 0
              ? prevIndex // Stay on the first row
              : prevIndex - dynamicColumns,
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
  }, [items, highlightedIndex, handleSelectItem, dynamicColumns]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {items.map((item, index) => (
          <Grid
            item
            key={item.id}
            xs={12}
            sm={6}
            md={Math.floor(12 / dynamicColumns)}
          >
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
                  highlightedIndex === index
                    ? "rgba(255,255,255,.2)"
                    : "inherit",
              }}
              onClick={() => handleSelectItem(index)}
            >
              {renderItem(item.data, highlightedIndex === index)}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
