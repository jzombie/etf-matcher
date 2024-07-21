import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  isValidElement,
  ReactElement,
} from "react";
import TransitionChildView from "./Transition.ChildView";

import "animate.css";
import Full from "@layoutKit/Full";
import Cover from "@layoutKit/Cover";
import debounceWithKey from "@utils/debounceWithKey";

export enum TransitionDirection {
  LEFT = "left",
  RIGHT = "right",
}

export type TransitionProps = {
  children: ReactNode;
  explicitDirection?: TransitionDirection;
};

const Transition = ({ children, explicitDirection }: TransitionProps) => {
  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTransitionHeight, setActiveTransitionHeight] = useState<
    number | null
  >(null);

  const keyedTransitionDirectionRef = useRef<TransitionDirection>(
    TransitionDirection.LEFT
  );

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentChild = React.Children.only(children);

    if (isValidElement(currentChild)) {
      const nextChildKey = (currentChild as ReactElement).key;
      const activeViewElement = isValidElement(activeView)
        ? (activeView as ReactElement)
        : null;
      const activeViewKey = activeViewElement?.key;

      if (nextChildKey !== activeViewKey) {
        if (activeViewRef.current) {
          const computedActiveViewStyle = window.getComputedStyle(
            activeViewRef.current
          );
          setActiveTransitionHeight(
            parseInt(computedActiveViewStyle.height, 10)
          );
        }

        if (nextChildKey && activeViewKey) {
          // For auto-determining transition direction
          keyedTransitionDirectionRef.current =
            parseInt(nextChildKey.toString(), 10) >
            parseInt(activeViewKey.toString(), 10)
              ? TransitionDirection.LEFT
              : TransitionDirection.RIGHT;
        }

        setIsTransitioning(true);
        setNextView(children);
      }
    }
  }, [children, activeView]);

  // Explicitly want the props to update on the following useMemo
  const keyedTransitionDirection = keyedTransitionDirectionRef.current;
  const { activeTransitionClass, nextTransitionClass } = useMemo(() => {
    const transitionDirection = explicitDirection || keyedTransitionDirection;

    if (transitionDirection === TransitionDirection.LEFT) {
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
  }, [explicitDirection, keyedTransitionDirection]);

  useEffect(() => {
    if (isTransitioning) {
      const handleAnimationEnd = () => {
        setIsTransitioning(false);
        setActiveView(nextView);
        setNextView(null);

        debounceWithKey(
          "post_transition:height_reset",
          () => {
            setActiveTransitionHeight(null);
          },
          500
        );
      };

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
  }, [isTransitioning, nextView, nextTransitionClass]);

  // Infer keys inline
  const activeViewKey = isValidElement(activeView)
    ? (activeView as ReactElement).key
    : null;
  const nextViewKey = isValidElement(nextView)
    ? (nextView as ReactElement).key
    : null;

  return (
    <Full
      style={activeTransitionHeight ? { height: activeTransitionHeight } : {}}
    >
      <Full
        ref={activeViewRef}
        className={`animate__animated ${
          isTransitioning ? activeTransitionClass : ""
        }`}
        style={{
          animationDuration: "0.2s",
        }}
      >
        <Full>
          <TransitionChildView key={`active-${activeViewKey}`}>
            {activeView}
          </TransitionChildView>
        </Full>
      </Full>
      {nextView ? (
        <Cover
          ref={nextViewRef}
          className={`animate__animated ${
            isTransitioning ? nextTransitionClass : ""
          }`}
          style={{
            animationDuration: "0.2s",
          }}
        >
          <TransitionChildView key={`next-${nextViewKey}`}>
            {nextView}
          </TransitionChildView>
        </Cover>
      ) : null}
    </Full>
  );
};

export default Transition;
