import { useNavigationType } from "react-router-dom";

export enum NavigationDirection {
  FORWARD = "forward",
  BACKWARD = "backward",
}

const useNavigationDirection = (): NavigationDirection => {
  const navigationType = useNavigationType();

  return navigationType === "PUSH"
    ? NavigationDirection.FORWARD
    : NavigationDirection.BACKWARD;
};

export default useNavigationDirection;
