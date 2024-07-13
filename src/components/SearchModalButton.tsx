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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useNavigate } from "react-router-dom";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useSearch from "@hooks/useSearch";

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
  } = useSearch({
    initialPageSize: 10,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

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

  const handleOk = (_: SyntheticEvent, exactSearchValue?: string) => {
    store.setState({ isSearchModalOpen: false });

    const locSearchQuery = exactSearchValue || searchQuery;

    if (searchQuery.length) {
      const searchParams = new URLSearchParams({ query: locSearchQuery });

      navigate(
        `/search?${searchParams.toString()}${
          exactSearchValue ? "&exact=true" : ""
        }`
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
      console.debug("Closing modal due to location change", location);
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
        open={isModalOpen}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            width: "50vw",
            maxWidth: "500px",
            minWidth: "300px",
            height: "60vh",
            minHeight: 300,
            maxHeight: "80vh",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "rgba(31,31,31,.8)",
            border: "2px rgba(38,100,100,.8) solid",
            backdropFilter: "blur(10px)",
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
            <div
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "transparent",
                zIndex: 1,
              }}
            ></div>
            <List>
              {searchResults.map((searchResult, idx) => (
                <ListItem
                  key={idx}
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
                  <ListItemText
                    primary={searchResult.symbol}
                    secondary={
                      <Typography
                        variant="body2"
                        style={{ opacity: 0.5, float: "right" }}
                      >
                        {searchResult.company}
                      </Typography>
                    }
                  />
                </ListItem>
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
                count={Math.ceil(totalSearchResults / pageSize)}
                page={page}
                onChange={(event, nextPage) => setPage(nextPage)}
                showFirstButton
                showLastButton
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
