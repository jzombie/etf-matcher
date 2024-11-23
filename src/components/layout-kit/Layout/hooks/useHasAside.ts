import React, { Children, useMemo } from "react";

import Aside from "../Aside";

// Check if an "Aside" component is a direct child
export default function useHasAside(children: React.ReactNode) {
  const hasAside = useMemo(
    () =>
      Children.toArray(children).some(
        (child) => React.isValidElement(child) && child.type === Aside,
      ),
    [children],
  );

  return hasAside;
}
