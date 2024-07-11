import React, { useEffect, useRef, SyntheticEvent } from "react";
import { Button, Modal, Form, Input, InputRef, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import useSearch from "@hooks/useSearch";

export default function SearchModalButton() {
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
    totalPages,
    setPageSize,
    pageSize,
    remaining,
    resetSearch,
  } = useSearch({
    initialPageSize: 10,
  });

  // const [searchValue, setSearchValue] = useState<string>("");
  // const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  // const [totalSearchResults, setTotalSearchResults] = useState<number>(0);
  // const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  // TODO: Update accordingly
  // const [symbolDetail, setSymbolDetail] = useState<any>({});
  const inputRef = useRef<InputRef>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset search value and selected index on close
    if (!isModalOpen) {
      resetSearch();
    } else {
      // First, blur the currently active element, if any
      if (
        document.activeElement &&
        document.activeElement instanceof HTMLElement
      ) {
        (document.activeElement as HTMLElement).blur();
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
    const input = inputRef.current?.input;

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
        `/search?${searchParams.toString()}&exact=${Boolean(exactSearchValue)}`
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
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchResults.length - 1)
      );
    } else if (evt.code === "ArrowUp") {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

  // useEffect(() => {
  //   store.searchSymbols(searchValue).then((searchResultsWithTotalCount) => {
  //     const { results, total_count } = searchResultsWithTotalCount;

  //     setSearchResults(results);
  //     setTotalSearchResults(total_count);
  //   });
  // }, [searchValue]);

  // TODO: Update w/ icon, etc. once ready
  // useEffect(() => {
  //   for (const symbol of searchResults) {
  //     store.fetchSymbolDetail(symbol).then((detail) => {
  //       setSymbolDetail((prev) => ({ ...prev, [symbol]: detail }));
  //     });
  //   }
  // }, [searchResults]);

  const isModalOpenStableRef = useStableCurrentRef(isModalOpen);
  useEffect(() => {
    if (location && isModalOpenStableRef.current) {
      console.debug("Closing modal due to location change", location);
      handleCancel();
    }
  }, [location, isModalOpenStableRef]);

  return (
    <>
      <Button type="default" icon={<SearchOutlined />} onClick={showModal}>
        Search
      </Button>
      <Modal
        // Empty title prevents the close button from overlaying the input element
        title="&nbsp;"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: !searchResults.length }}
        styles={{
          content: {
            backgroundColor: "rgba(31,31,31,.8)",
            border: "2px rgba(38,100,100,.8) solid",
            backdropFilter: "blur(5px)",
          },
          // header: {
          //   backgroundColor: "rgba(0,0,0,.2)",
          // },
          // body: {
          //   backgroundColor: "rgba(0,0,0,.4)",
          // },
        }}
        // TODO: Blur effect
        // style={{
        //   backdropFilter: "blur(5px)",
        // }}
      >
        {isModalOpen && (
          <>
            <Form>
              <Input
                ref={inputRef}
                placeholder='Search for Symbol (e.g. "AAPL" or "Apple")'
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                value={searchQuery}
                prefix={<SearchOutlined />}
              />
              {searchResults.map((searchResult, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor:
                      idx === selectedIndex
                        ? "rgba(255,255,255,.2)"
                        : "transparent",
                    padding: "5px",
                    overflow: "auto",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {searchResult["symbol"]}
                  </span>

                  <span style={{ float: "right", opacity: 0.5 }}>
                    {searchResult["company"]}
                  </span>
                </div>
              ))}
              {
                // TODO: Show all results
                remaining > 0 && (
                  <div>
                    <Button>+ {remaining} remaining</Button>
                  </div>
                )
              }

              {/* <div>DEBUG total pages: {totalPages}</div>
              <div>DEBUG calc: {totalPages * pageSize}</div>
              <div>DEBUG page: {page}</div>
              <div>DEBUG remaining: {remaining}</div>
              <div>DEBUG total search results: {totalSearchResults}</div> */}
              {
                // TODO: This `totalPages` less than 1000 might not be needed if the styles work better
                // i.e. box contain
              }
              {totalSearchResults > pageSize && (
                <div style={{ marginTop: 10 }}>
                  {
                    // TODO: Wire up (create `useSearch` hook to make this reusable)
                  }
                  <Pagination
                    align="center"
                    defaultCurrent={page}
                    showSizeChanger={false}
                    pageSize={pageSize}
                    onChange={(nextPage, nextPageSize) => {
                      setPage(nextPage);
                      setPageSize(nextPageSize);
                    }}
                    total={totalSearchResults}
                  />
                </div>
              )}
              {totalSearchResults > 0 && (
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: ".8rem",
                    marginTop: 10,
                  }}
                >
                  Total results for query &quot;{searchQuery}&quot;:{" "}
                  {totalSearchResults}
                </div>
              )}
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}
