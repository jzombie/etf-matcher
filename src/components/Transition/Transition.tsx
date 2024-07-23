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

/**
 * IMPORTANT: `trigger` should be caused by a post async action.
 * Example: Setting it to page number might be problemetic if the page number is
 * known before the resulting data. It is best to set the trigger as the resulting
 * data itself, as the result of the asynchronous action.
 */
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
      {
        // Note: This check regarding `nextKey` !== `activeKey` bypasses the
        // transition entirely so that it doesn't freak React out. This situation
        // can occur if rapidly toggling a transition and the behavior could likely
        // be improved.
        nextView && nextKey !== activeKey && (
          <TransitionChildView
            ref={nextViewRef}
            key={nextKey}
            transitionClassName={isTransitioning ? nextTransitionClass : ""}
            animationDurationCSS={animationDurationCSS}
            asNextView
          >
            {nextView}
          </TransitionChildView>
        )
      }
    </Full>
  );
};

export default Transition;
