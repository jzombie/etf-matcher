import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  ButtonBase,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";

import DialogModal, { DialogModalProps } from "@components/DialogModal";
import EncodedImage from "@components/EncodedImage";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import { RustServiceTickerSearchResult } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

import useTickerSearchModalContent from "./useTickerSearchModalContent";

export type TickerSearchModalProps = Omit<DialogModalProps, "children"> & {
  onSelectSearchQuery?: (searchQuery: string, isExact: boolean) => void;
  onSelectTicker?: (searchResult: RustServiceTickerSearchResult) => void;
  onCancel?: () => void;
};

// TODO: Implement `initialValue`
// TODO: Implement ability to disable items (for the purposes of adding new tickers to an existing list)
export default function TickerSearchModal({
  open: isOpen,
  onClose,
  onSelectSearchQuery,
  onSelectTicker,
  onCancel,
}: TickerSearchModalProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onCancelStableCurrentRef = useStableCurrentRef(onCancel);
  const onCloseStableCurrentRef = useStableCurrentRef(onClose);
  const onSelectSearchQueryStableCurrentRef =
    useStableCurrentRef(onSelectSearchQuery);

  const onSelectTickerResultStableCurrentRef =
    useStableCurrentRef(onSelectTicker);

  // Handle auto-blur/focus
  useEffect(() => {
    if (isOpen) {
      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSelectedIndex,
    selectedIndex,
    totalSearchResults,
    page,
    setPage,
    pageSize,
    totalPages,
  } = useTickerSearchModalContent();

  const handleCancel = useCallback(() => {
    try {
      // Reset search query and error on close
      setSearchQuery("");
      setError(null);

      const onCancel = onCancelStableCurrentRef.current;
      const onClose = onCloseStableCurrentRef.current;

      if (typeof onCancel === "function") {
        onCancel();
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      // TODO: Route error to UI notification
      customLogger.error("Error cancelling search:", error);
    }
  }, [setSearchQuery, onCancelStableCurrentRef, onCloseStableCurrentRef]);

  const handleClose = useCallback(() => {
    try {
      // Invoke `handleCancel` if no search query
      if (searchQuery === "") {
        return handleCancel();
      }

      // Reset search query and error on close
      setSearchQuery("");
      setError(null);

      const onClose = onCloseStableCurrentRef.current;
      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      // TODO: Route error to UI notification
      customLogger.error("Error closing search:", error);
    }
  }, [searchQuery, handleCancel, setSearchQuery, onCloseStableCurrentRef]);

  const handleOk = useCallback(
    (
      _?: SyntheticEvent,
      exactSearchValue?: string,
      selectedTicker?: RustServiceTickerSearchResult,
    ) => {
      try {
        // Close the modal
        handleClose();

        const locSearchQuery = exactSearchValue || searchQuery;

        const onSelectSearchQuery = onSelectSearchQueryStableCurrentRef.current;
        if (typeof onSelectSearchQuery === "function") {
          onSelectSearchQuery(locSearchQuery, Boolean(exactSearchValue));
        }

        if (selectedTicker) {
          const onSelectTickerResult =
            onSelectTickerResultStableCurrentRef.current;
          if (typeof onSelectTickerResult === "function") {
            onSelectTickerResult(selectedTicker);
          }
        }
      } catch (error) {
        // TODO: Route error to UI notification
        customLogger.error("Error confirming search:", error);
      }
    },
    [
      handleClose,
      searchQuery,
      onSelectSearchQueryStableCurrentRef,
      onSelectTickerResultStableCurrentRef,
    ],
  );

  const handleInputChange = useCallback(
    (evt: React.BaseSyntheticEvent) => {
      const { value } = evt.target;

      // Validate input
      if (!/^[a-zA-Z0-9.\-\s]*$/.test(value)) {
        setError(
          "Only alphanumeric characters, hyphens, periods, and spaces are allowed.",
        );
        return;
      }

      setError(null); // Clear the error if the input is valid
      setSearchQuery(value);
      setSelectedIndex(-1);
    },
    [setSearchQuery, setSelectedIndex],
  );

  const handleInputKeyDown = useCallback(
    (evt: React.KeyboardEvent) => {
      if (evt.code === "Enter" || evt.key === "Enter") {
        if (selectedIndex === -1) {
          handleOk(evt);
        } else if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const selectedSearchResult = searchResults[selectedIndex];
          handleOk(evt, selectedSearchResult.symbol, selectedSearchResult);
        }
      } else if (evt.code === "ArrowDown") {
        setSelectedIndex((prevIndex) => {
          const newIndex = Math.min(prevIndex + 1, searchResults.length - 1);
          const selectedListItem = window.document.getElementById(
            `search-result-${newIndex}`,
          );
          selectedListItem?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
          return newIndex;
        });
      } else if (evt.code === "ArrowUp") {
        setSelectedIndex((prevIndex) => {
          const newIndex = Math.max(prevIndex - 1, 0);
          const selectedListItem = window.document.getElementById(
            `search-result-${newIndex}`,
          );
          selectedListItem?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
          return newIndex;
        });
      }
    },
    [handleOk, searchResults, selectedIndex, setSelectedIndex],
  );

  return (
    <DialogModal open={isOpen} onClose={handleClose} staticHeight>
      <DialogTitle>
        <TextField
          fullWidth
          inputRef={inputRef}
          placeholder='Search for Symbol (e.g. "AAPL" or "Apple")'
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          value={searchQuery}
          error={Boolean(error)}
          helperText={error}
          InputProps={{
            startAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </DialogTitle>
      <DialogContent
        sx={{
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <List>
          {searchResults.map((searchResult, idx) => (
            <ButtonBase
              key={idx}
              onClick={(_) => handleOk(_, searchResult.symbol, searchResult)}
              sx={{
                display: "block",
                width: "100%",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,.1)",
                },
              }}
            >
              <ListItem
                id={`search-result-${idx}`}
                sx={{
                  backgroundColor:
                    idx === selectedIndex
                      ? "rgba(255,255,255,.2)"
                      : "transparent",
                  padding: "5px",
                  overflow: "auto",
                }}
              >
                <ListItemIcon>
                  <EncodedImage
                    key={searchResult.logo_filename}
                    encSrc={searchResult.logo_filename}
                    style={{ width: 50, height: 50 }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{ marginLeft: 1 }}
                  primary={
                    <div style={{ overflow: "auto" }}>
                      {searchResult.symbol}
                      <span style={{ float: "right", opacity: 0.2 }}>
                        {searchResult.exchange_short_name}
                      </span>
                    </div>
                  }
                  secondary={
                    <Typography variant="body2" style={{ opacity: 0.5 }}>
                      {searchResult.company_name}
                    </Typography>
                  }
                />
              </ListItem>
            </ButtonBase>
          ))}
        </List>
      </DialogContent>
      {
        // FIXME: This box should technically be inside of `DialogActions` but
        // the overall UI layout is perfect here.
        //
        // TODO: On very small viewports, move the pagination into the scroll body.
      }
      <Box>
        {totalSearchResults > pageSize && (
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, nextPage) => setPage(nextPage)}
              // Note: Consider showing `showFirst/LastButton` if horizontal space allows
              showFirstButton={false}
              showLastButton={false}
              sx={{ display: "inline-block" }}
            />
          </div>
        )}
      </Box>
      <DialogActions>
        {totalSearchResults > 0 && (
          <div
            style={{
              fontStyle: "italic",
              fontSize: ".8rem",
              float: "left",
            }}
          >
            Total results for query &quot;{searchQuery}&quot;:{" "}
            {totalSearchResults}
          </div>
        )}
        <Button
          onClick={handleCancel}
          variant={!searchResults.length ? "contained" : "text"}
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={handleOk}
          disabled={!searchResults.length}
          variant={searchResults.length ? "contained" : "text"}
        >
          OK
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
