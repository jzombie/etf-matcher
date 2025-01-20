import React, { useCallback, useEffect, useRef } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useURLState from "@hooks/useURLState";

import customLogger from "@utils/customLogger";

import TickerSearchModal, { SearchQueryResult } from "./TickerSearchModal";

export type TickerSearchModalButtonProps = {
  highlight?: boolean;
};

export default function TickerSearchModalButton({
  highlight,
}: TickerSearchModalButtonProps) {
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

  const handleSearchQuery = useCallback(
    (searchQueryResults: SearchQueryResult[]) => {
      if (searchQueryResults.length > 1) {
        customLogger.warn("`searchQueryResults` truncated to the first value");
      }

      const searchQuery = searchQueryResults[0].searchQuery;
      const isExact = searchQueryResults[0].isExact;

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
        onSelect={handleSearchQuery}
      />
    </>
  );
}
