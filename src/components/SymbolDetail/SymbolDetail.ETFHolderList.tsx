import React from "react";
import ETFHolder from "./SymbolDetail.ETFHolder";

export type ETFHolderListProps = {
  etfSymbols?: string[] | undefined;
};

export default function ETFHolderList({ etfSymbols }: ETFHolderListProps) {
  if (!etfSymbols) {
    return null;
  }

  return (
    <div>
      {etfSymbols.map((etfSymbol) => (
        <ETFHolder key={etfSymbol} etfSymbol={etfSymbol} />
      ))}
    </div>
  );
}
