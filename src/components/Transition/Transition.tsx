import React, { ReactNode } from "react";
import TransitionChildView from "./Transition.ChildView";
import "animate.css";
import Full from "@layoutKit/Full";

import useTransition from "./useTransition";

export type TransitionDirection = "left" | "right";

export type TransitionType = "slide" | "fade";

export type TransitionProps = {
  children: ReactNode;
  direction?: TransitionDirection;
  transitionType?: TransitionType;
  transitionDurationMs?: number;
  trigger?: unknown;
};

const Transition = ({
  children,
  direction,
  transitionType = "slide",
  transitionDurationMs = 500,
  trigger,
}: TransitionProps) => {
  const {
    activeViewRef,
    activeKey,
    isTransitioning,
    activeTransitionClass,
    animationDurationCSS,
    activeView,
    nextView,
    nextViewRef,
    nextKey,
    nextTransitionClass,
  } = useTransition({
    children,
    direction,
    transitionType,
    transitionDurationMs,
    trigger,
  });

  return (
    <Full>
      <TransitionChildView
        ref={activeViewRef}
        key={activeKey}
        transitionClassName={isTransitioning ? activeTransitionClass : ""}
        animationDurationCSS={animationDurationCSS}
      >
        {activeView}
      </TransitionChildView>
      {nextView && (
        <TransitionChildView
          ref={nextViewRef}
          key={nextKey}
          transitionClassName={isTransitioning ? nextTransitionClass : ""}
          animationDurationCSS={animationDurationCSS}
          asNextView
        >
          {nextView}
        </TransitionChildView>
      )}
    </Full>
  );
};

export default Transition;
