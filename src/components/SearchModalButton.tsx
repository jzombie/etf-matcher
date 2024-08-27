import React, { SyntheticEvent, useCallback, useEffect, useRef } from "react";

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

import useSearch from "@hooks/useSearch";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useURLState from "@hooks/useURLState";

import DialogModal from "./DialogModal";
import EncodedImage from "./EncodedImage";
import TickerSearchModal from "./TickerSearchModal";

export type SearchModalButtonProps = {
  highlight?: boolean;
};

// TODO: Wrap `TickerSearchModal`
// TODO: Rename to `TickerSearchModalButton`
export default function SearchModalButton({
  highlight,
}: SearchModalButtonProps) {
  const searchModalButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // This state is managed by the store so that it can be opened elsewhere
  const { isSearchModalOpen } = useStoreStateReader("isSearchModalOpen");

  // Handle auto-blur/focus
  useEffect(() => {
    const searchModalButton = searchModalButtonRef.current;

    if (isSearchModalOpen && searchModalButton) {
      // This prevents an issue where hitting `Enter` on the form input would
      // re-open the modal
      searchModalButton.blur();

      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [isSearchModalOpen]);

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

  const handleOpenModal = useCallback(() => {
    store.setState({ isSearchModalOpen: true });
  }, []);

  const handleCloseModal = useCallback(() => {
    // Reset search query on close
    setSearchQuery("");

    store.setState({ isSearchModalOpen: false });
  }, [setSearchQuery]);

  const { setURLState, toBooleanParam } = useURLState();

  const handleSearch = useCallback(
    (searchQuery: string, isExact: boolean) => {
      // Close the modal
      handleCloseModal();

      if (searchQuery.length) {
        // Navigate to the search results
        setURLState(
          {
            query: searchQuery,
            exact: toBooleanParam(isExact, true),
          },
          false,
          "/search",
        );
      }
    },
    [setURLState, toBooleanParam, handleCloseModal],
  );

  return (
    <>
      <Button
        ref={searchModalButtonRef}
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={handleOpenModal}
        color={highlight ? "primary" : "inherit"}
      >
        Search
      </Button>
      <TickerSearchModal
        open={isSearchModalOpen}
        onClose={handleCloseModal}
        onSearch={handleSearch}
      />
    </>
  );
}
