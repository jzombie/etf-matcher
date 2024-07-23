import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  isValidElement,
  ReactElement,
  useCallback,
} from "react";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

import type { TransitionProps } from "./types";

export default function useTransition({
  children,
  direction,
  transitionType = "slide",
  transitionDurationMs = 500,
  trigger,
}: TransitionProps) {
  const initialTriggerLockRef = useRef<unknown>(trigger);

  const initialKey = useMemo(() => {
    const currentChild = React.Children.only(children);
    return isValidElement(currentChild)
      ? currentChild.key?.toString() || Math.random().toString(36).substr(2, 9)
      : Math.random().toString(36).substr(2, 9);
  }, [children]);

  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(initialKey);
  const [nextKey, setNextKey] = useState<string | null>(null);

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);

  const childrenStableRef = useStableCurrentRef(children);
  const activeViewStableRef = useStableCurrentRef(activeView);

  useEffect(() => {
    if (trigger === initialTriggerLockRef.current) {
      // Don't run on initial render (it doesn't work nicely here)
      return;
    } else {
      // Clear the initial trigger set so that we can navigate
      // back to it (i.e. first page in pagination)
      initialTriggerLockRef.current = null;
    }

    const children = childrenStableRef.current;
    const activeView = activeViewStableRef.current;

    const currentChild = React.Children.only(children);

    if (isValidElement(currentChild)) {
      const activeViewElement = isValidElement(activeView)
        ? (activeView as ReactElement)
        : null;

      if (
        trigger !== undefined ||
        currentChild.key !== activeViewElement?.key
      ) {
        setNextKey(
          currentChild.key?.toString() ||
            Math.random().toString(36).substr(2, 9)
        );
        setIsTransitioning(true);
        setNextView(children);
      }
    }
  }, [childrenStableRef, activeViewStableRef, trigger]);

  const { activeTransitionClass, nextTransitionClass } = useMemo(() => {
    if (transitionType === "fade") {
      return {
        activeTransitionClass: "animate__fadeOut",
        nextTransitionClass: "animate__fadeIn",
      };
    }

    const transitionDirection = direction;

    if (transitionDirection === "left") {
      return {
        activeTransitionClass: "animate__slideOutLeft",
        nextTransitionClass: "animate__slideInRight",
      };
    } else {
      return {
        activeTransitionClass: "animate__slideOutRight",
        nextTransitionClass: "animate__slideInLeft",
      };
    }
  }, [direction, transitionType]);

  const handleAnimationEnd = useCallback(() => {
    setIsTransitioning(false);
    setActiveKey(nextKey);
    setActiveView(nextView);
    setNextView(null);
  }, [nextKey, nextView]);

  useEffect(() => {
    if (isTransitioning) {
      const activeViewElement = activeViewRef.current;
      const nextViewElement = nextViewRef.current;

      if (activeViewElement) {
        activeViewElement.addEventListener("animationend", handleAnimationEnd, {
          once: true,
        });
      }

      if (nextViewElement) {
        nextViewElement.classList.add(nextTransitionClass);
      }

      return () => {
        if (activeViewElement) {
          activeViewElement.removeEventListener(
            "animationend",
            handleAnimationEnd
          );
        }
      };
    }
  }, [isTransitioning, nextTransitionClass, handleAnimationEnd]);

  const animationDurationCSS = useMemo<string>(
    () => `${transitionDurationMs / 1000}s`,
    [transitionDurationMs]
  );

  return {
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
  };
}
