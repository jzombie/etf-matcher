import React from "react";

import { useLocation } from "react-router-dom";

import Transition from "@components/Transition";

import useLazy from "@hooks/useLazy";
import useNavigationDirection from "@hooks/useNavigationDirection";

import SingleUseOutlet from "./SingleUseOutlet";

// FIXME: This was disabled due to having a blinking effect on dynamically loaded
// content during page changes. It might could be improved.
export default function TransitionOutlet() {
  const navigationDirection = useNavigationDirection();
  const { pathname: locationPathname } = useLocation();

  // The use of this `lazyTrigger` fixes an issue where the trigger could invoke
  // before the actual outlet content has changed, thus skipping the transition
  // entirely.
  const lazyTrigger = useLazy(locationPathname);

  return (
    <Transition
      direction={navigationDirection === "backward" ? "right" : "left"}
      trigger={lazyTrigger}
    >
      {
        // The `Transition` component creates a new version of the `SingleUseOutlet`
        // each time the trigger is called. Each of these have a single use-case to
        // the current set of children given by `react-router-dom`.
      }
      <SingleUseOutlet />
    </Transition>
  );
}
