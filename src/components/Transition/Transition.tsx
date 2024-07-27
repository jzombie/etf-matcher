import React from "react";

import Full from "@layoutKit/Full";
import "animate.css";

import TransitionChildView from "./Transition.ChildView";
import { TransitionProps } from "./types";
import useTransition from "./useTransition";

/**
 * IMPORTANT: Ensure that `trigger` is invoked *after* all asynchronous actions
 * on the underlying data view have completed to avoid unpredictable results.
 *
 * Example: If setting `trigger` to a page number, it may cause issues if the
 * page number is known before the resulting data is available. Instead, set the
 * `trigger` as the resulting data itself, which is the outcome of the
 * asynchronous action.
 *
 * During view transitions, both the view being transitioned from and the view
 * being transitioned to will coexist in the DOM temporarily. This can cause
 * problems if their children elements rely on unique DOM IDs.
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
