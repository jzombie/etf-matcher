import React, { useEffect, useState, useRef, SyntheticEvent } from "react";
import { Button, Modal, Form, Input, InputRef } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import { store } from "@hooks/useStoreStateReader";

export default function SearchModalButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<InputRef>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset search value and selected index on close
    if (!isModalOpen) {
      setSearchValue("");
      setSearchResults([]);
      setSelectedIndex(-1);
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [isModalOpen]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = (_: SyntheticEvent, exactSearchValue?: string) => {
    setIsModalOpen(false);

    const locSearchValue = exactSearchValue || searchValue;

    if (searchValue.length) {
      const searchParams = new URLSearchParams({ query: locSearchValue });

      navigate(
        `/search?${searchParams.toString()}&exact=${Boolean(exactSearchValue)}`
      );
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
        const exactSearchValue = searchResults[selectedIndex];

        handleOk(evt, exactSearchValue);
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
    store
      .searchSymbols(searchValue)
      .then((symbols) => setSearchResults(symbols));
  }, [searchValue]);

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
                placeholder='Search for Ticker Symbol (e.g. "AAPL")'
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                value={searchValue}
              />
            </Form>

            {searchResults.map((searchResult, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor:
                    idx === selectedIndex
                      ? "rgba(255,255,255,.2)"
                      : "transparent",
                  padding: "5px",
                }}
              >
                {searchResult}
              </div>
            ))}
          </>
        )}
      </Modal>
    </>
  );
}
