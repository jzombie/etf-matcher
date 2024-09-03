import useTickerSearch from "@hooks/useTickerSearch";

export default function useTickerSearchModalContent() {
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
  } = useTickerSearch({
    initialPageSize: 10,
  });

  // TODO: If no search results, show most recently viewed

  return {
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
  };
}
