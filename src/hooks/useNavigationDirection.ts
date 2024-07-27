import { useEffect, useRef, useState } from "react";

import { useLocation, useNavigationType } from "react-router-dom";

export type NavigationDirection = "forward" | "backward";

const useNavigationDirection = (): NavigationDirection => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState<NavigationDirection>("forward");
  const locationStack = useRef<{ key: string; pathname: string }[]>([]);
  const previousKey = useRef<string | null>(null);

  // TODO: This still needs some slight improvement when handling forward
  // arrow navigation, as it sometimes thinks it's a `backward` navigation
  useEffect(() => {
    // Extract current path and key from the location object
    const currentPath = location.pathname;
    const currentKey = location.key;

    if (navigationType === "PUSH") {
      // If the navigation type is "PUSH", add the current location to the stack
      locationStack.current.push({ key: currentKey, pathname: currentPath });
      setDirection("forward");
    } else if (navigationType === "POP") {
      // If the navigation type is "POP", check the last location in the stack
      const lastLocation = locationStack.current.pop();
      if (lastLocation && lastLocation.key !== currentKey) {
        // If the last location key is different from the current key, set direction to "BACKWARD"
        setDirection("backward");
      } else {
        // Otherwise, set direction to "FORWARD"
        setDirection("forward");
      }
    }

    // Update the previous key to the current key
    previousKey.current = currentKey;
  }, [location, navigationType]);

  return direction;
};

export default useNavigationDirection;
