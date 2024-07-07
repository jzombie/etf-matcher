import React from "react";

export type SymbolContainerProps = {
  children: React.ReactNode;
};

export default function SymbolContainer({
  children,
  ...args
}: SymbolContainerProps) {
  // TODO: Monitor time and percentage on screen and use to collect metrics
  // about which symbols are looked at the longest. This isn't intended for
  // invasive tracking, but is actually intended to help me personally understand
  // which symbols I may be spending more time looking into without taking action.
  //
  // This state should tie into the store and persist locally to help build a
  // profile.

  return <div {...args}>{children}</div>;
}
