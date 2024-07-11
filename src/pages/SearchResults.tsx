import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Button } from "antd";
import { MiniChart, CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { store } from "@hooks/useStoreStateReader";
import SymbolContainer from "@components/SymbolContainer";

import type { SearchResultsWithTotalCount } from "@src/store";

export default function SearchResults() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExact, setIsExact] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        setSearchQuery(value.trim());
      }
      if (key === "exact") {
        // String values from URL
        setIsExact(value === "true" || value === "1");
      }
    });
  }, [location]);

  useEffect(() => {
    store
      .searchSymbols(searchQuery)
      .then((searchResultsWithTotalCount: SearchResultsWithTotalCount) => {
        const { results: searchResults } = searchResultsWithTotalCount;

        const symbols = searchResults.map((result) => result.symbol);

        let returnedSymbols: string[] = symbols;

        if (isExact) {
          if (symbols.includes(searchQuery.trim())) {
            returnedSymbols = [searchQuery];
          } else {
            returnedSymbols = [];
          }
        }

        setSymbols(returnedSymbols);
      });
  }, [searchQuery, isExact]);

  if (!searchQuery) {
    return <div>No search query...</div>;
  }

  return (
    <div>
      Search results for: {searchQuery}
      {symbols.map((symbol, idx) => (
        <SymbolContainer key={idx} tickerSymbol={symbol}>
          <MiniChart
            symbol={symbol}
            colorTheme="dark"
            width="100%"
            copyrightStyles={tradingViewCopyrightStyles}
          />
          <CompanyProfile
            symbol={symbol}
            width="100%"
            height={300}
            copyrightStyles={tradingViewCopyrightStyles}
          />
          <Button onClick={() => store.addSymbolToPortfolio(symbol)}>
            Add {symbol} to Portfolio
          </Button>

          <Button onClick={() => store.PROTO_getSymbolDetail(symbol)}>
            PROTO_getSymbolDetail()
          </Button>

          <Button onClick={() => store.PROTO_getSymbolETFHolders(symbol)}>
            PROTO_getSymbolETFHolders()
          </Button>
        </SymbolContainer>
      ))}
    </div>
  );
}
