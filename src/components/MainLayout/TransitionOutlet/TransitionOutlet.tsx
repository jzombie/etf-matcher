import React from "react";
import { useLocation } from "react-router-dom";

import useNavigationDirection from "@hooks/useNavigationDirection";

import Transition from "@components/Transition";
import WrappedOutlet from "./WrappedOutlet";

export default function TransitionOutlet() {
  const navigationDirection = useNavigationDirection();
  const { pathname: locationPathname } = useLocation();

  return (
    <Transition
      direction={navigationDirection === "backward" ? "right" : "left"}
      trigger={locationPathname}
    >
      <WrappedOutlet />
    </Transition>
  );
}
