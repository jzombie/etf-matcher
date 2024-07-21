import React, {
  useState,
  useEffect,
  ReactNode,
  useRef,
  isValidElement,
  ReactElement,
  useMemo,
} from "react";
import TransitionChildView from "./Transition.ChildView";

import "animate.css";
import Full from "@layoutKit/Full";
import debounceWithKey from "@utils/debounceWithKey";

export type TransitionProps = {
  children: ReactNode;
};

const Transition = ({ children }: TransitionProps) => {
  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTransitionHeight, setActiveTransitionHeight] = useState<
    number | null
  >(null);
  const [transitionDirection, setTransitionDirection] =
    useState<string>("left");

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);
  const nextViewKey = useRef<string | number | null>(null);

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
          setTransitionDirection(
            parseInt(nextChildKey.toString(), 10) >
              parseInt(activeViewKey.toString(), 10)
              ? "left"
              : "right"
          );
        }

        setIsTransitioning(true);
        setNextView(children);
        nextViewKey.current = nextChildKey; // Store the key
      }
    }
  }, [children, activeView]);

  const { activeTransitionClass, nextTransitionClass } = useMemo(() => {
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
  }, [transitionDirection]);

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

  return (
    <Full
      style={activeTransitionHeight ? { height: activeTransitionHeight } : {}}
    >
      <div
        ref={activeViewRef}
        className={`animate__animated ${
          isTransitioning ? activeTransitionClass : ""
        }`}
        style={{
          display: "flex",
          flex: 1,
          animationDuration: "0.2s",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Full>
          <TransitionChildView key={nextViewKey.current}>
            {activeView}
          </TransitionChildView>
        </Full>
      </div>
      {nextView ? (
        <div
          ref={nextViewRef}
          className={`animate__animated ${
            isTransitioning ? nextTransitionClass : ""
          }`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            animationDuration: "0.2s",
          }}
        >
          <TransitionChildView key={nextViewKey.current}>
            {nextView}
          </TransitionChildView>
        </div>
      ) : null}
    </Full>
  );
};

export default Transition;
