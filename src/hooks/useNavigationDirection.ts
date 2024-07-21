import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export enum NavigationDirection {
  FORWARD = "forward",
  BACKWARD = "backward",
}

const useNavigationDirection = (): NavigationDirection => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState<NavigationDirection>(
    NavigationDirection.FORWARD
  );
  const locationStack = useRef<{ key: string; pathname: string }[]>([]);
  const previousKey = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentKey = location.key;

    if (navigationType === "PUSH") {
      locationStack.current.push({ key: currentKey, pathname: currentPath });
      setDirection(NavigationDirection.FORWARD);
    } else if (navigationType === "POP") {
      const lastLocation = locationStack.current.pop();
      if (lastLocation && lastLocation.key !== currentKey) {
        setDirection(NavigationDirection.BACKWARD);
      } else {
        setDirection(NavigationDirection.FORWARD);
      }
    }

    previousKey.current = currentKey;
  }, [location, navigationType]);

  return direction;
};

export default useNavigationDirection;
