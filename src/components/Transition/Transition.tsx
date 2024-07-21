import React, {
  useState,
  useEffect,
  ReactNode,
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

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentChild = React.Children.only(children);

    if (isValidElement(currentChild)) {
      const currentChildKey = (currentChild as ReactElement).key;
      const activeViewElement = isValidElement(activeView)
        ? (activeView as ReactElement)
        : null;
      const activeViewKey = activeViewElement?.key;

      if (currentChildKey !== activeViewKey) {
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

  return (
    // <div
    //   style={{
    //     display: "flex",
    //     flexDirection: "column",
    //     width: "100%",
    //     height: "100%",
    //     overflow: "hidden",
    //     position: "relative",
    //   }}
    // >

    <Full>
      <div
        ref={activeViewRef}
        className={`animate__animated ${
          isTransitioning ? "animate__slideOutLeft" : ""
        }`}
        style={{ flex: 1 }}
      >
        {activeView}
      </div>
      {nextView ? (
        <div
          ref={nextViewRef}
          className={`animate__animated ${
            isTransitioning ? "animate__slideInRight" : ""
          }`}
          style={{ flex: 1, position: "absolute", top: 0, left: 0 }}
        >
          {nextView}
        </div>
      ) : null}
    </Full>
  );
};

export default Transition;
