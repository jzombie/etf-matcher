import React, { useEffect, useState, useRef, SyntheticEvent } from "react";
import { Button, Modal, Form, Input, InputRef } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import type { SearchResult } from "@src/store";

export default function SearchModalButton() {
  const { isSearchModalOpen: isModalOpen } =
    useStoreStateReader("isSearchModalOpen");

  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalSearchResults, setTotalSearchResults] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  // TODO: Update accordingly
  // const [symbolDetail, setSymbolDetail] = useState<any>({});
  const inputRef = useRef<InputRef>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset search value and selected index on close
    if (!isModalOpen) {
      setSearchValue("");
      setSearchResults([]);
      setTotalSearchResults(0);
      setSelectedIndex(-1);
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
  }, [isModalOpen]);

  const showModal = () => {
    store.setState({ isSearchModalOpen: true });
  };

  const handleOk = (_: SyntheticEvent, exactSearchValue?: string) => {
    store.setState({ isSearchModalOpen: false });

    const locSearchValue = exactSearchValue || searchValue;

    if (searchValue.length) {
      const searchParams = new URLSearchParams({ query: locSearchValue });

      navigate(
        `/search?${searchParams.toString()}&exact=${Boolean(exactSearchValue)}`
      );
    }
  };

  const handleCancel = () => {
    store.setState({ isSearchModalOpen: false });
  };

  const handleInputChange = (evt: React.BaseSyntheticEvent) => {
    setSearchValue(evt.target.value.toUpperCase());
    setSelectedIndex(-1);
  };

  const handleInputKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.code === "Enter") {
      if (selectedIndex == -1) {
        handleOk(evt);
      } else if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const selectedSearchResult = searchResults[selectedIndex];

        handleOk(evt, selectedSearchResult.s);
      }
    } else if (evt.code === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchResults.length - 1)
      );
    } else if (evt.code === "ArrowUp") {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

  useEffect(() => {
    store.searchSymbols(searchValue).then((searchResultsWithTotalCount) => {
      const { results, total_count } = searchResultsWithTotalCount;

      setSearchResults(results);
      setTotalSearchResults(total_count);
    });
  }, [searchValue]);

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
        title="&nbsp;"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: !searchResults.length }}
      >
        {isModalOpen && (
          <>
            <Form>
              <Input
                ref={inputRef}
                placeholder='Search for Symbol (e.g. "AAPL" or "Apple")'
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                value={searchValue}
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
                  {searchResult["s"]}

                  <span style={{ float: "right" }}>{searchResult["c"]}</span>
                </div>
              ))}
              Total Results: {totalSearchResults}
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}
