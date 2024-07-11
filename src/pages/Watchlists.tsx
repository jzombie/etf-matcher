import React from "react";
// import { Button } from "antd";
import SymbolDetail from "@components/SymbolDetail";

import useStoreStateReader from "@hooks/useStoreStateReader";

export default function Watchlists() {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

  const portfolioSymbolBuckets = symbolBuckets?.filter(
    (symbolBucket) => symbolBucket.type === "watchlist"
  );

  return (
    <div>
      {/*
        <Button>Create new Watchlist</Button>
        */}

      <hr />
      <div>
        <h2>My Watchlists</h2>
        {portfolioSymbolBuckets?.map((symbolBucket, idx) => (
          <div key={idx}>
            {symbolBucket.name}

            {symbolBucket.symbols.map((symbol) => (
              <SymbolDetail key={symbol} tickerSymbol={symbol} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
