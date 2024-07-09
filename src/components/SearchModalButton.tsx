import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Form, Input, InputRef } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import { store } from "@hooks/useStoreStateReader";

export default function SearchModalButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const inputRef = useRef<InputRef>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset search value on close
    if (!isModalOpen) {
      setSearchValue("");
      setSearchResults([]);
    } else {
      // The usage of `setTimeout` fixes an issue where repeatedly opening
      // the modal would not automatically focus the input.
      // Also, setting the `autofocus` property on the input, directly, did
      // not achieve the desired effect.
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [isModalOpen]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);

    if (searchValue.length) {
      console.warn("TODO: Handle search", searchValue);

      const searchParams = new URLSearchParams({ query: searchValue });

      // Encode the search value to ensure it's safe to include in the URL
      // const encodedSearchValue = encodeURIComponent(searchValue);

      // navigate("/search?query=" + encodedSearchValue);
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (evt: React.BaseSyntheticEvent) => {
    setSearchValue(evt.target.value.toUpperCase());
  };

  const handleInputKeyDown = (evt: { code: string }) => {
    if (evt.code === "Enter") {
      handleOk();
    }
  };

  useEffect(() => {
    store
      .searchSymbols(searchValue)
      .then((symbols) => setSearchResults(symbols));
  }, [searchValue]);

  const isModalOpenStableRef = useStableCurrentRef(isModalOpen);
  useEffect(() => {
    // Note: The usage of `isModalOpenStableRef` prevents the conditional
    // from auto-closing the modal each time the modal opens!
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
              <div key={idx}>{searchResult}</div>
            ))}
          </>
        )}
      </Modal>
    </>
  );
}
