import React, { SyntheticEvent, useEffect, useRef, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import {
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

import store from "@src/store";

import useSearch from "@hooks/useSearch";
import useURLState from "@hooks/useURLState";

import DialogModal from "./DialogModal";
import EncodedImage from "./EncodedImage";

export type SearchModalButtonProps = {
  highlight?: boolean;
};

export default function SearchModalButton({
  highlight,
}: SearchModalButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  } = useSearch({
    initialPageSize: 10,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const handleShowModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    // Reset search query on close
    setSearchQuery("");

    setIsModalOpen(false);
  };

  const { setURLState, toBooleanParam } = useURLState();

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
        "/search",
      );
    }
  };

  const handleInputChange = (evt: React.BaseSyntheticEvent) => {
    setSearchQuery(evt.target.value);
    setSelectedIndex(-1);
  };

  const handleInputKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.code === "Enter" || evt.key === "Enter") {
      if (selectedIndex === -1) {
        handleOk(evt);
      } else if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const selectedSearchResult = searchResults[selectedIndex];
        handleOk(evt, selectedSearchResult.symbol);
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
  };

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [isModalOpen]);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={handleShowModal}
        color={highlight ? "primary" : "inherit"}
      >
        Search
      </Button>
      <DialogModal open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>
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
          <List>
            {searchResults.map((searchResult, idx) => (
              <ButtonBase
                key={idx}
                onClick={(_) => handleOk(_, searchResult.symbol)}
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
            onClick={handleCloseModal}
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
    </>
  );
}
