import React, {
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useRef,
  isValidElement,
  ReactElement,
} from "react";
import "animate.css";

import Full from "@layoutKit/Full";

export type TransitionProps = {
  children: ReactNode;
};

const Transition = ({ children }: TransitionProps) => {
  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] =
    useState<string>("left");

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
        if (nextChildKey && activeViewKey) {
          if (parseInt(nextChildKey, 10) > parseInt(activeViewKey, 10)) {
            setTransitionDirection("left");
          } else {
            setTransitionDirection("right");
          }
        }

        setIsTransitioning(true);
        setNextView(children);
      }
    }
  }, [children, activeView]);

  useEffect(() => {
    if (isTransitioning) {
      const handleAnimationEnd = () => {
        setIsTransitioning(false);
        setActiveView(nextView);
        setNextView(null);
      };

      const activeViewElement = activeViewRef.current;
      const nextViewElement = nextViewRef.current;

      if (activeViewElement) {
        activeViewElement.addEventListener("animationend", handleAnimationEnd, {
          once: true,
        });
      }

      // Ensure nextView starts its transition after activeView has started transitioning out
      if (nextViewElement) {
        nextViewElement.classList.add("animate__slideInRight");
      }

      // Cleanup
      return () => {
        if (activeViewElement) {
          activeViewElement.removeEventListener(
            "animationend",
            handleAnimationEnd
          );
        }
      };
    }
  }, [isTransitioning, nextView]);

  const { activeTransitionClass, nextTransitionClass } = useMemo(() => {
    console.log({ transitionDirection });

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

  return (
    <Full>
      <div
        ref={activeViewRef}
        className={`animate__animated ${
          isTransitioning ? activeTransitionClass : ""
        }`}
        style={{ flex: 1 }}
      >
        {activeView}
      </div>
      {nextView ? (
        <div
          ref={nextViewRef}
          className={`animate__animated ${
            isTransitioning ? nextTransitionClass : ""
          }`}
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          {nextView}
        </div>
      ) : null}
    </Full>
  );
};

export default Transition;
