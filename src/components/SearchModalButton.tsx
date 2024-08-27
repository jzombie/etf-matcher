import React, { useCallback, useEffect, useRef } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useURLState from "@hooks/useURLState";

import TickerSearchModal from "./TickerSearchModal";

export type SearchModalButtonProps = {
  highlight?: boolean;
};

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

  const handleOpen = useCallback(() => {
    store.setState({ isSearchModalOpen: true });
  }, []);

  const handleClose = useCallback(() => {
    store.setState({ isSearchModalOpen: false });
  }, []);

  const { setURLState, toBooleanParam } = useURLState();

  const handleSearch = useCallback(
    (searchQuery: string, isExact: boolean) => {
      // Close the modal
      handleClose();

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
    [setURLState, toBooleanParam, handleClose],
  );

  return (
    <>
      <Button
        ref={searchModalButtonRef}
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={handleOpen}
        color={highlight ? "primary" : "inherit"}
      >
        Search
      </Button>
      <TickerSearchModal
        open={isSearchModalOpen}
        onClose={handleClose}
        onSearch={handleSearch}
      />
    </>
  );
}
