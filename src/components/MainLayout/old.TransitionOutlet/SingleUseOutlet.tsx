import React, { useEffect, useState } from "react";

import { useLocation, useOutlet } from "react-router-dom";

export default function SingleUseOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  const [renderedChildren, setRenderedChildren] = useState(null);

  // The children are what change, not the outlet itself. Determine the children,
  // and if not currently rendering children, render them.
  useEffect(() => {
    setRenderedChildren((prev) => {
      if (prev) {
        return prev;
      } else {
        return outlet?.props.children;
      }
    });
  }, [outlet?.props.children]);

  return (
    <>
      {renderedChildren &&
        React.cloneElement(renderedChildren, {
          key: location.pathname,
        })}
    </>
  );
}
