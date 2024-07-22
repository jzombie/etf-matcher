import React from "react";
import { useLocation } from "react-router-dom";

import useNavigationDirection from "@hooks/useNavigationDirection";

import Transition from "@components/Transition";
import SingleUseOutlet from "./SingleUseOutlet";

export default function TransitionOutlet() {
  const navigationDirection = useNavigationDirection();
  const { pathname: locationPathname } = useLocation();

  return (
    <Transition
      direction={navigationDirection === "backward" ? "right" : "left"}
      trigger={locationPathname}
    >
      {
        // The `Transition` component creates multiple versions of the
        // `SingleUseOutlet`, each of which have a single use-case to the
        // current set of children given by `react-router-dom`.
      }
      <SingleUseOutlet />
    </Transition>
  );
}
