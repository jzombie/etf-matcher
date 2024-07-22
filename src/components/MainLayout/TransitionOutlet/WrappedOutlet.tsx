import React, { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";

export default function WrappedOutlet() {
  const location = useLocation();
  const element = useOutlet();

  const [renderedChildren, setRenderedChildren] = useState(null);

  useEffect(() => {
    setRenderedChildren((prev) => {
      if (prev) {
        return prev;
      } else {
        return element?.props.children;
      }
    });
  }, [element?.props.children]);

  return (
    <>
      {renderedChildren &&
        React.cloneElement(renderedChildren, {
          key: location.pathname,
        })}
    </>
  );
}
