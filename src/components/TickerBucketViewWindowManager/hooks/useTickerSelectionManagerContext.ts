import { useContext } from "react";

import { TickerSelectionManagerContext } from "../providers/TickerSelectionManagerProvider";

export default function useTickerSelectionManagerContext() {
  const context = useContext(TickerSelectionManagerContext);
  if (!context) {
    throw new Error(
      "useTickerSelectionManagerContext must be used within a TickerSelectionManagerContext",
    );
  }
  return context;
}
