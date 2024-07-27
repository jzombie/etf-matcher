import React, { useEffect, useRef, SyntheticEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Pagination,
  ListItemIcon,
  ButtonBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router-dom";

import customLogger from "@utils/customLogger";

import EncodedImage from "./EncodedImage";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useSearch from "@hooks/useSearch";
import useURLState from "@hooks/useURLState";

// TODO: Replace modal with `TransparentModal`

export type SearchModalButtonProps = {
  highlight?: boolean;
};

export default function SearchModalButton({
  highlight = false,
}: SearchModalButtonProps) {
  const { isSearchModalOpen: isModalOpen } =
    useStoreStateReader("isSearchModalOpen");

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalSearchResults,
    selectedIndex,
    setSelectedIndex,
    page,
    setPage,
    pageSize,
    // remaining,
    resetSearch,
    totalPages,
  } = useSearch({
    initialPageSize: 10,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const { setURLState, toBooleanParam } = useURLState<{
    query: string | null;
    exact: string | null;
  }>();

  // Handle auto-focus when the modal opens
  useEffect(() => {
    // Reset search value and selected index on close
    if (!isModalOpen) {
      resetSearch();
    } else {
      // First, blur the currently active element, if any
      if (
        window.document.activeElement &&
        window.document.activeElement instanceof HTMLElement
      ) {
        (window.document.activeElement as HTMLElement).blur();
      }

      // TODO: This still needs to improve on Safari when closing the Modal and then
      // re-opening it again
      setTimeout(() => {
        // Now focus the input element
        inputRef.current?.focus();
      });
    }
  }, [isModalOpen, resetSearch]);

  // Prevent other elements from stealing focus
  // TODO: This might need to be disabled on mobile so that the virtual keyboard can disappear as needed (add isMobile detection)
  useEffect(() => {
    const input = inputRef.current;

    if (isModalOpen && input) {
      const _handleInputBlur = () => {
        input.focus();
      };

      input.addEventListener("blur", _handleInputBlur);

      return () => {
        input.removeEventListener("blur", _handleInputBlur);
      };
    }
  }, [isModalOpen]);

  const showModal = () => {
    store.setState({ isSearchModalOpen: true });
  };

  const handleOk = (_?: SyntheticEvent, exactSearchValue?: string) => {
    store.setState({ isSearchModalOpen: false });

    const locSearchQuery = exactSearchValue || searchQuery;

    if (searchQuery.length) {
      setURLState(
        {
          query: locSearchQuery,
          exact: toBooleanParam(Boolean(exactSearchValue), true),
        },
        false,
        "/search"
      );
    }
  };

  const handleCancel = () => {
    store.setState({ isSearchModalOpen: false });
  };

  const handleInputChange = (evt: React.BaseSyntheticEvent) => {
    setSearchQuery(evt.target.value);
    setSelectedIndex(-1);
  };

  const handleInputKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.code === "Enter") {
      if (selectedIndex == -1) {
        handleOk(evt);
      } else if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const selectedSearchResult = searchResults[selectedIndex];

        handleOk(evt, selectedSearchResult.symbol);
      }
    } else if (evt.code === "ArrowDown") {
      setSelectedIndex((prevIndex) => {
        const newIndex = Math.min(prevIndex + 1, searchResults.length - 1);
        const selectedListItem = window.document.getElementById(
          `search-result-${newIndex}`
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
          `search-result-${newIndex}`
        );
        selectedListItem?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
        return newIndex;
      });
    }
  };

  const isModalOpenStableRef = useStableCurrentRef(isModalOpen);
  useEffect(() => {
    if (location && isModalOpenStableRef.current) {
      customLogger.debug("Closing modal due to location change", location);
      handleCancel();
    }
  }, [location, isModalOpenStableRef]);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={showModal}
        color={highlight ? "primary" : "inherit"}
      >
        Search
      </Button>
      <Dialog
        // Note: Setting this key fixes an issue where the transparent `presentation`
        // element would remain in place if the viewport were resized while the modal
        // was open, preventing further UI interaction.
        key={isModalOpen ? "open" : "closed"}
        open={isModalOpen}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            width: {
              xs: "100vw", // Full width for extra small screens
              sm: "50vw", // 50% width for small screens and up
            },
            maxWidth: {
              xs: "100vw", // Full width for extra small screens
              sm: "500px", // Max width of 500px for small screens and up
            },
            minWidth: "300px",
            height: {
              xs: "100vh", // Full height for extra small screens
              sm: "60vh", // 60% height for small screens and up
            },
            minHeight: 300,
            maxHeight: "80vh",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "rgba(31,31,31,.8)",
            border: "2px rgba(38,100,100,.8) solid",
            backdropFilter: "blur(10px)",
            "@media (max-width: 728px)": {
              width: "100vw",
              height: "100dvh", // Assuming the browser supports `dvh`
              maxWidth: "100vw",
              maxHeight: "100dvh", // Assuming the browser supports `dvh`
              border: "none",
              borderRadius: 0,
            },
          },
        }}
      >
        <DialogTitle sx={{ paddingBottom: 0 }}>
          <TextField
            fullWidth
            inputRef={inputRef}
            placeholder='Search for Symbol (e.g. "AAPL" or "Apple")'
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            value={searchQuery}
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
          <form noValidate autoComplete="off">
            <List>
              {searchResults.map((searchResult, idx) => (
                <ButtonBase
                  key={idx}
                  onClick={(_) => handleOk(_, searchResult.symbol)}
                  sx={{
                    // TODO: Rework this to work better in conjunction w/ arrow keys
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
                        // Note: Key is used here to fix issue where logo could
                        // be attached to wrong symbol
                        key={searchResult.logo_filename}
                        // TODO: Include support for fallback image
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
          </form>
        </DialogContent>
        <>
          {
            // TODO: Skip these if the viewport is too small
          }
          {
            // remaining > 0 && <Button>+ {remaining} remaining</Button>
          }
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
        </>
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
      </Dialog>
    </>
  );
}
