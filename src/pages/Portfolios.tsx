import React from "react";
// import { Button } from "antd";
import SymbolDetail from "@components/SymbolDetail";

import useStoreStateReader from "@hooks/useStoreStateReader";

export default function Portfolios() {
  const { symbolBuckets } = useStoreStateReader("symbolBuckets");

  const portfolioSymbolBuckets = symbolBuckets?.filter(
    (symbolBucket) => symbolBucket.type === "portfolio"
  );

  return (
    <div>
      {/*
        <Button>Create new Portfolio</Button>
        */}

      <hr />
      <div>
        <h2>My Portfolios</h2>
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

// TODO: Make use of persistent session storage for portfolios, with ability to clear data
// TODO: Enable import / export of Portfolios
// TODO: Use Web Share (and Web Share Target [for PWAs]) API as potential transport agent (binary encoding / decoding w/ Base65?)
