import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import SearchIcon from "@mui/icons-material/Search";
import SubjectIcon from "@mui/icons-material/Subject";
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

import { RustServiceTickerSearchResult } from "@services/RustService";

import DialogModal from "@components/DialogModal";
import EncodedImage from "@components/EncodedImage";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useKeyboardEvents from "@hooks/useKeyboardEvents";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

import type { TickerSearchModalProps } from "../types";
import useTickerSearchModalContent from "../useTickerSearchModalContent";

export type BasicTickerSearchModalProps = TickerSearchModalProps;

// TODO: Implement `initialValue`
export default function BasicTickerSearchModal({
  open: isOpen,
  onClose,
  onSelectSearchQuery,
  onSelectTicker,
  onCancel,
  disabledTickerIds = [],
  textInputPlaceholder = 'Search for Symbol (e.g. "AAPL" or "Apple")',
  searchButtonAriaLabel = "Ticker Search",
  longFormAriaLabel = "Extract Tickers from Text",
}: BasicTickerSearchModalProps) {
  const { triggerUIError } = useAppErrorBoundary();
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
    resultsMode,
  } = useTickerSearchModalContent({
    isSearchModalOpen: isOpen,
  });

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
      triggerUIError(new Error("Error cancelling search"));
      customLogger.error("Error cancelling search:", error);
    }
  }, [
    setSearchQuery,
    onCancelStableCurrentRef,
    onCloseStableCurrentRef,
    triggerUIError,
  ]);

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
      triggerUIError(new Error("Error closing search"));
      customLogger.error("Error closing search:", error);
    }
  }, [
    searchQuery,
    handleCancel,
    setSearchQuery,
    onCloseStableCurrentRef,
    triggerUIError,
  ]);

  const handleOk = useCallback(
    (
      _?: SyntheticEvent | KeyboardEvent,
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
        triggerUIError(new Error("Error confirming search"));
        customLogger.error("Error confirming search:", error);
      }
    },
    [
      handleClose,
      searchQuery,
      onSelectSearchQueryStableCurrentRef,
      onSelectTickerResultStableCurrentRef,
      triggerUIError,
    ],
  );

  const handleInputChange = useCallback(
    (evt: React.BaseSyntheticEvent) => {
      const { value } = evt.target;

      // Validate input
      if (!/^[a-zA-Z0-9.\-\s&]*$/.test(value)) {
        setError(
          "Only alphanumeric characters, hyphens, periods, spaces, and the & symbol are allowed.",
        );
        return;
      }

      setError(null); // Clear the error if the input is valid
      setSearchQuery(value);
      setSelectedIndex(-1);
    },
    [setSearchQuery, setSelectedIndex],
  );

  const { onKeyDown } = useKeyboardEvents({
    attachToWindow: false,
    keydown: {
      ArrowDown: () => {
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
      },
      ArrowUp: () => {
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
      },
      ArrowRight: () => {
        // no-op
        // This is used to prevent default `ArrowRight` handling from propagating
      },
      ArrowLeft: () => {
        // no-op
        // This is used to prevent default `ArrowLeft` handling from propagating
      },
      Enter: (evt) => {
        if (selectedIndex === -1) {
          handleOk(evt);
        } else if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const selectedSearchResult = searchResults[selectedIndex];
          handleOk(evt, selectedSearchResult.symbol, selectedSearchResult);
        }
      },
    },
  });

  const filteredResults = useMemo(
    () =>
      searchResults.filter(
        (searchResult) => !disabledTickerIds?.includes(searchResult.ticker_id),
      ),
    [searchResults, disabledTickerIds],
  );

  return (
    <DialogModal open={isOpen} onClose={handleClose} staticHeight>
      <DialogTitle>
        <TextField
          fullWidth
          inputRef={inputRef}
          placeholder={textInputPlaceholder}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          value={searchQuery}
          error={Boolean(error)}
          helperText={error}
          slotProps={{
            input: {
              startAdornment: (
                <>
                  <IconButton disabled>
                    <SearchIcon aria-label={searchButtonAriaLabel} />
                  </IconButton>
                  <IconButton
                    onClick={
                      // TODO: Handle long-form mode
                      () => null
                    }
                  >
                    <SubjectIcon aria-label={longFormAriaLabel} />
                  </IconButton>
                </>
              ),
            },
          }}
        />
      </DialogTitle>
      <DialogContent
        sx={{
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {searchResults.length > 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontStyle: "italic" }}
          >
            {resultsMode == "recently_viewed" &&
              `Recently viewed result${searchResults.length !== 1 ? "s" : ""}`}
            {resultsMode == "ticker_tape" &&
              `Result${searchResults.length !== 1 ? "s" : ""} from Ticker Tape`}
          </Typography>
        )}

        <List>
          {filteredResults.map((searchResult, idx) => (
            <ButtonBase
              key={searchResult.ticker_id}
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
                    <Typography variant="body2" color="textSecondary">
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
        // the overall UI layout is decent here.
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
        {
          // TODO: Adjust `totalSearchResults` to discount potential results
          // which include `disabledTickerIds`
        }
        {searchQuery.trim() && totalSearchResults > 0 && (
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
          disabled={!searchQuery.trim().length || !searchResults.length}
          variant={searchResults.length ? "contained" : "text"}
        >
          OK
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
