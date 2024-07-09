import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Button } from "antd";
import { CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { store } from "@hooks/useStoreStateReader";
import SymbolContainer from "@components/SymbolContainer";

export default function SearchResults() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        setSearchQuery(value);
      }
    });
  }, [location]);

  if (!searchQuery) {
    return <div>No search query...</div>;
  }

  return (
    <div>
      Search results for: {searchQuery}
      {
        // TODO: Do an actual symbol search here and iterate over each result
      }
      <SymbolContainer tickerSymbol={searchQuery}>
        <CompanyProfile
          symbol={searchQuery}
          width="100%"
          height={300}
          copyrightStyles={tradingViewCopyrightStyles}
        />
        <Button onClick={() => store.addSymbolToPortfolio(searchQuery)}>
          Add {searchQuery} to Portfolio
        </Button>
      </SymbolContainer>
    </div>
  );
}
